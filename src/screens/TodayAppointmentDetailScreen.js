import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { fetchVisitDetails } from '../constants/services/appointmentservice';

// ── Feature flag: header "download" icon is temporarily hidden per request.
// Set back to true whenever it should be shown again — the button's code
// below is untouched, only its rendering is gated by this flag.
const SHOW_DOWNLOAD_BUTTON = false;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * approvingOfficer looks like:
 *   "Kartik Krishna M ( Scientist  D )"
 * Split into { name, designation }.
 */
const parseApprovingOfficer = (raw) => {
  if (!raw) return { name: '', designation: '' };
  const match = String(raw).match(/^(.*?)\s*\((.*)\)\s*$/);
  if (!match) return { name: raw.trim(), designation: '' };
  return { name: match[1].trim(), designation: match[2].trim() };
};

/** meetingDateTime is "DD/MM/YYYY HH:mm" → split into date/time + weekday parts */
const parseMeetingDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return { date: '', time: '', day: '', dayNum: '', month: '' };

  const [datePart, timePart] = dateTimeStr.split(' ');
  const [dd, mm, yyyy] = (datePart || '').split('/');
  const dateObj = new Date(Number(yyyy), Number(mm) - 1, Number(dd));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    date: datePart || '',
    time: timePart || '',
    day: dayNames[dateObj.getDay()] || '',
    dayNum: dd || '',
    month: monthNames[dateObj.getMonth()] || '',
  };
};

/** Mask an ID number, showing only the last 4 characters */
const maskIdNumber = (idNo) => {
  if (!idNo) return '-';
  const str = String(idNo);
  return str.length > 4 ? `****${str.slice(-4)}` : str;
};

/** Map a raw GetVisitDetails API record into the shape the UI below expects */
const mapVisitDetailsToAppointmentData = (record) => {
  const approving = parseApprovingOfficer(record.approvingOfficer);
  const dt = parseMeetingDateTime(record.meetingDateTime);

  return {
    // Officer / meeting info
    officerName: record.officerVisited || '',
    approvingOfficerName: approving.name,
    designation: approving.designation,
    department: '',
    agency: '',

    // Date / time
    date: dt.date,
    day: dt.day,
    dayNum: dt.dayNum,
    month: dt.month,
    time: dt.time,
    registrationDate: record.registrationDate || '',

    // Pass / registration
    passNo: record.registrationNo,
    status: record.status,
    statusLabel: record.statusLabel,
    qrCodeUrl: record.qrCodeUrl || '',

    // Visitor info — comes straight from the API now, no AsyncStorage needed
    visitorName: record.visitorName || '',
    fatherHusbandName: record.fatherName || '',
    gender: record.gender || '',
    age: record.age || '',
    mobileNo: record.mobileNo || '',
    email: record.email || '',
    visitorAddress: record.address || '',
    idProofType: record.idProofType || '',
    idProofNo: record.idProofNo || '',

    // Visit meta
    location: '',
    purpose: record.visitPurpose || '-',
    remark: record.remark || '',
    vehicleType: record.vehicleType || '',
    participants: 1,
    visitorInTime: record.visitorInTime || '',
    visitorOutTime: record.visitorOutTime || '',
  };
};

// Pinch-to-zoom / pan tuning
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
// If the released scale is this close to 1, treat it as "zoomed out" and
// snap fully back to the original size AND position.
const RESET_THRESHOLD = 1.08;

/**
 * Find the two touches that belong to the pinch gesture by their stable
 * `identifier`, rather than by array index — RN does not guarantee touches
 * stay in the same array order between events, which caused the jumpy /
 * "not listening" zoom behaviour.
 */
const getTrackedTouches = (touches, ids) => {
  if (!ids || ids.length < 2) return null;
  const t1 = touches.find((t) => t.identifier === ids[0]);
  const t2 = touches.find((t) => t.identifier === ids[1]);
  if (!t1 || !t2) return null;
  return [t1, t2];
};

/** Distance between two touch points (pageX/pageY) */
const getTouchDistance = (touches) => {
  const [t1, t2] = touches;
  const dx = t1.pageX - t2.pageX;
  const dy = t1.pageY - t2.pageY;
  return Math.sqrt(dx * dx + dy * dy);
};

/** Midpoint between two touch points, used so panning tracks the fingers */
const getTouchMidpoint = (touches) => {
  const [t1, t2] = touches;
  return {
    x: (t1.pageX + t2.pageX) / 2,
    y: (t1.pageY + t2.pageY) / 2,
  };
};

/** Clamp a number between min and max */
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Max pan offset that keeps the zoomed card fully covering the wrapper,
 * so the user can never drag it fully off-screen. Because the transform
 * array applies translate BEFORE scale, the on-screen offset ends up being
 * (translateValue * scale) — dividing by scale here keeps the stored
 * translate value consistent with that on-screen behaviour.
 */
const getMaxPanOffset = (scaleValue, size) => {
  if (scaleValue <= 1 || !size.width || !size.height) return { x: 0, y: 0 };
  return {
    x: (size.width * (scaleValue - 1)) / (2 * scaleValue),
    y: (size.height * (scaleValue - 1)) / (2 * scaleValue),
  };
};

const TodayAppointmentDetailScreen = ({ navigation, route }) => {
  const [personalDetails, setPersonalDetails] = useState(null);
  const [appointmentData, setAppointmentData] = useState(route?.params?.passData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // ── Pinch-to-zoom + pan state ─────────────────────────────────────────────
  // Zoom with two fingers, and once zoomed in, drag with a SINGLE finger in
  // any direction (up/down/left/right) to move around the pass — the same
  // gesture pattern as a native photo viewer. Two fingers still let you pan
  // while pinching, exactly as before.
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(null);
  const initialMidpoint = useRef(null);
  const lastMidpoint = useRef(null);
  const trackedIds = useRef(null); // identifiers of the two fingers doing the pinch

  // Single-finger pan (active only once the card is zoomed in)
  const singleTouchStart = useRef(null); // { x, y } page coords when this pan leg began

  // 'none' | 'pinch' | 'pan' — tracks which gesture is currently driving the
  // transform, so we can detect finger-count transitions mid-gesture (e.g.
  // lifting one finger while pinching) and re-baseline instead of jumping.
  const gestureMode = useRef('none');

  // panResponder closures are created once via useRef, so `isZoomed` state
  // would otherwise be captured stale (always `false`). Mirror it into a ref
  // so the gesture handlers always see the current value — this was the
  // root cause of single-finger panning being ignored after zooming in.
  const isZoomedRef = useRef(false);
  useEffect(() => {
    isZoomedRef.current = isZoomed;
  }, [isZoomed]);

  // Measured pixel size of the pinch/pan wrapper, used to clamp panning so
  // the card can't be dragged off-screen. Captured via onLayout below.
  const containerSize = useRef({ width: 0, height: 0 });

  const resetZoom = () => {
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    setIsZoomed(false);
  };

  const clearGestureRefs = () => {
    initialDistance.current = null;
    initialMidpoint.current = null;
    lastMidpoint.current = null;
    trackedIds.current = null;
    singleTouchStart.current = null;
    gestureMode.current = 'none';
  };

  /** Snapshot the live animated translate values into lastTranslate so the
   *  next gesture leg (pinch → pan, or pan → pinch) continues smoothly
   *  from wherever the card currently is, instead of jumping. */
  const captureCurrentTranslate = () => {
    translateX.stopAnimation((x) => {
      lastTranslate.current.x = x;
    });
    translateY.stopAnimation((y) => {
      lastTranslate.current.y = y;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Claim the gesture for:
      //  - any 2-finger touch (pinch start), always
      //  - a single-finger touch, but ONLY once the card is already zoomed in
      //    (so normal single-finger scrolling keeps working everywhere else)
      onStartShouldSetPanResponder: (evt) => {
        const { touches } = evt.nativeEvent;
        return touches.length === 2 || (touches.length === 1 && isZoomedRef.current);
      },
      onMoveShouldSetPanResponder: (evt) => {
        const { touches } = evt.nativeEvent;
        return touches.length === 2 || (touches.length === 1 && isZoomedRef.current);
      },
      onStartShouldSetPanResponderCapture: (evt) => {
        const { touches } = evt.nativeEvent;
        return touches.length === 2 || (touches.length === 1 && isZoomedRef.current);
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        const { touches } = evt.nativeEvent;
        return touches.length === 2 || (touches.length === 1 && isZoomedRef.current);
      },
      // Once we've claimed the gesture, don't let the ScrollView (or anything
      // else) steal it back mid-gesture — this was the main cause of fingers
      // "not being listened to" correctly, including single-finger panning
      // stopping halfway through a drag.
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { touches } = evt.nativeEvent;
        if (touches.length === 2) {
          gestureMode.current = 'pinch';
          trackedIds.current = [touches[0].identifier, touches[1].identifier];
          initialDistance.current = getTouchDistance(touches);
          initialMidpoint.current = getTouchMidpoint(touches);
          lastMidpoint.current = initialMidpoint.current;
        } else if (touches.length === 1 && isZoomedRef.current) {
          gestureMode.current = 'pan';
          singleTouchStart.current = { x: touches[0].pageX, y: touches[0].pageY };
        }
      },

      onPanResponderMove: (evt) => {
        const { touches } = evt.nativeEvent;

        // ── Two fingers down: pinch-zoom, with the midpoint also panning ──
        if (touches.length >= 2) {
          if (gestureMode.current !== 'pinch') {
            // Just gained a second finger (e.g. was single-finger panning) —
            // snapshot where we are now and re-baseline so there's no jump.
            captureCurrentTranslate();
            gestureMode.current = 'pinch';
            trackedIds.current = [touches[0].identifier, touches[1].identifier];
            initialDistance.current = getTouchDistance(touches);
            initialMidpoint.current = getTouchMidpoint(touches);
            lastMidpoint.current = initialMidpoint.current;
            return;
          }

          const pair = getTrackedTouches(touches, trackedIds.current);
          if (!pair || !initialDistance.current) return;

          // Zoom: ratio of current finger distance to the distance when the pinch started
          const newDistance = getTouchDistance(pair);
          const rawScale = lastScale.current * (newDistance / initialDistance.current);
          const clampedScale = Math.max(MIN_ZOOM, Math.min(rawScale, MAX_ZOOM));
          scale.setValue(clampedScale);

          // Pan: let the two fingers drag the zoomed card around, clamped so
          // it can't be pulled fully off-screen.
          const midpoint = getTouchMidpoint(pair);
          const dx = midpoint.x - lastMidpoint.current.x;
          const dy = midpoint.y - lastMidpoint.current.y;
          const maxOffset = getMaxPanOffset(clampedScale, containerSize.current);
          translateX.setValue(clampValue(lastTranslate.current.x + dx, -maxOffset.x, maxOffset.x));
          translateY.setValue(clampValue(lastTranslate.current.y + dy, -maxOffset.y, maxOffset.y));
          return;
        }

        // ── One finger down: pan only, and only once already zoomed in ──
        if (touches.length === 1) {
          if (!isZoomedRef.current) return;

          if (gestureMode.current !== 'pan') {
            // Just dropped from two fingers to one (or a fresh single-finger
            // drag on an already-zoomed pass) — re-baseline so there's no jump.
            captureCurrentTranslate();
            gestureMode.current = 'pan';
            singleTouchStart.current = { x: touches[0].pageX, y: touches[0].pageY };
            return;
          }

          if (!singleTouchStart.current) return;

          const dx = touches[0].pageX - singleTouchStart.current.x;
          const dy = touches[0].pageY - singleTouchStart.current.y;
          const maxOffset = getMaxPanOffset(lastScale.current, containerSize.current);
          translateX.setValue(clampValue(lastTranslate.current.x + dx, -maxOffset.x, maxOffset.x));
          translateY.setValue(clampValue(lastTranslate.current.y + dy, -maxOffset.y, maxOffset.y));
        }
      },

      onPanResponderRelease: () => {
        // Persist current values so the next gesture continues from here
        scale.stopAnimation((finalScale) => {
          if (finalScale <= RESET_THRESHOLD) {
            // Close enough to the original size — snap fully back to
            // scale 1 AND position (0,0), not just the scale.
            resetZoom();
            clearGestureRefs();
            return;
          }

          const clamped = Math.max(MIN_ZOOM, Math.min(finalScale, MAX_ZOOM));
          lastScale.current = clamped;
          setIsZoomed(true);
          Animated.spring(scale, { toValue: clamped, useNativeDriver: true }).start();

          // Snap position back within bounds if the release left it outside
          // the allowed pan range for the final scale.
          const maxOffset = getMaxPanOffset(clamped, containerSize.current);
          translateX.stopAnimation((x) => {
            const boundedX = clampValue(x, -maxOffset.x, maxOffset.x);
            lastTranslate.current.x = boundedX;
            Animated.spring(translateX, { toValue: boundedX, useNativeDriver: true }).start();
          });
          translateY.stopAnimation((y) => {
            const boundedY = clampValue(y, -maxOffset.y, maxOffset.y);
            lastTranslate.current.y = boundedY;
            Animated.spring(translateY, { toValue: boundedY, useNativeDriver: true }).start();
          });

          clearGestureRefs();
        });
      },

      onPanResponderTerminate: () => {
        // Still persist position/scale so a forced termination (e.g. an
        // interrupting system gesture) doesn't lose the user's pan/zoom.
        translateX.stopAnimation((x) => {
          lastTranslate.current.x = x;
        });
        translateY.stopAnimation((y) => {
          lastTranslate.current.y = y;
        });
        clearGestureRefs();
      },
    })
  ).current;

  useEffect(() => {
    loadPersonalDetails();
    loadAppointmentDetails();
  }, []);

  const loadPersonalDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem('personalDetails');
      if (storedDetails) {
        setPersonalDetails(JSON.parse(storedDetails));
      }
    } catch (error) {
      console.error('Error loading personal details:', error);
    }
  };

  /**
   * Resolve Vis_Reg_No the same way CreateAppointmentScreen does — either
   * passed via route.params, or read from the stored login session.
   */
  const resolveVisRegNo = async () => {
    if (route?.params?.visRegNo) return String(route.params.visRegNo);
    try {
      const s = await AsyncStorage.getItem('loginSession');
      if (s) {
        const obj = JSON.parse(s);
        const id = obj?.Vis_Reg_No ?? obj?.visRegNo ?? '';
        if (id) return String(id);
      }
      const u = await AsyncStorage.getItem('userData');
      if (u) {
        const obj = JSON.parse(u);
        const id = obj?.visRegNo ?? obj?.Vis_Reg_No ?? '';
        if (id) return String(id);
      }
    } catch (e) {
      console.error('AsyncStorage error:', e.message);
    }
    return '';
  };

  /**
   * Loads the full detail record for a single appointment via GetVisitDetails.
   * Triggered whenever this screen opens — e.g. tapping an appointment under
   * the "Approved" tab — using the registrationNo (VisRN) passed in route.params.
   */
  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const visRegNo = await resolveVisRegNo();
      if (!visRegNo) {
        throw new Error('Visitor registration number not found. Please log in again.');
      }

      // registrationNo (VisRN) must be passed in when navigating here,
      // e.g. navigation.navigate('TodayAppointmentDetail', { registrationNo: item.registrationNo, visRegNo })
      const visRN = route?.params?.registrationNo || route?.params?.passData?.passNo;
      if (!visRN) {
        throw new Error('Appointment registration number (VisRN) not found.');
      }

      const records = await fetchVisitDetails(visRegNo, visRN);
      const record = Array.isArray(records) ? records[0] : records;

      if (!record) {
        throw new Error('No matching visit request found for this visitor.');
      }

      setAppointmentData(mapVisitDetailsToAppointmentData(record));
    } catch (e) {
      console.error('Error loading appointment details:', e.message);
      setError(e.message || 'Failed to load appointment details.');
      // Keep whatever was passed via route params (if any) as a fallback
      if (!route?.params?.passData) {
        setAppointmentData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <ActivityIndicator size="large" color="#3477eb" />
        <Text style={styles.loadingText}>Loading pass details…</Text>
      </View>
    );
  }

  if (error && !appointmentData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#3477eb" />
        <Icon name="alert-circle-outline" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadAppointmentDetails}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // QR should only render when the API says the visit is Approved ("Y")
  // AND a URL was actually returned in qrCodeUrl.
  const showQr = !!appointmentData.qrCodeUrl && appointmentData.status === 'Y';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3477eb" />

      {/* Header */}
      <LinearGradient colors={['#3477eb', '#2563eb']} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pass Details</Text>
          {/* Download icon hidden per request — code kept intact, gated by
              SHOW_DOWNLOAD_BUTTON above. Flip that flag to true to bring it back. */}
          {SHOW_DOWNLOAD_BUTTON ? (
            <TouchableOpacity style={styles.shareBtn}>
              <Feather name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            // Empty placeholder keeps the title centered via space-between layout
            <View style={styles.shareBtn} />
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isZoomed}
      >
        {error && (
          <View style={styles.inlineErrorBanner}>
            <Icon name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={styles.inlineErrorText}>{error} Showing last known data.</Text>
          </View>
        )}

        {isZoomed && (
          <Text style={styles.zoomHint}>Drag with one finger to move around, pinch to zoom out, or tap Reset</Text>
        )}

        {/* Main Pass Card — wrap in the pinch-zoom/pan responder so two
            fingers zoom+pan, and (once zoomed in) a single finger drags the
            card around in any direction, while the page still scrolls
            normally with one finger when not zoomed. onLayout captures the
            wrapper's on-screen size so panning can be clamped to bounds. */}
        <View
          style={styles.zoomWrapper}
          {...panResponder.panHandlers}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            containerSize.current = { width, height };
          }}
        >
          <Animated.View
            style={[
              styles.passCard,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            {/* Top Banner */}
            <LinearGradient
              colors={['#00BCD4', '#0097A7']}
              style={styles.topBanner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bannerText}>गृह मंत्रालय • स्वागत संगठन</Text>
            </LinearGradient>

            {/* Header Row with Logo and Building Name */}
            <View style={styles.cardHeader}>
              <View style={styles.logoSection}>
                <Icon name="account-group" size={22} color="#0A2463" />
                <View>
                  <Text style={styles.logoTitle}>SWAGATAM</Text>
                  <Text style={styles.logoSubtitle}>Gateway to Visitor Convenience</Text>
                </View>
              </View>

              <View style={styles.centerSection}>
                <Text style={styles.buildingText}>( {appointmentData.department || 'Kartavya Bhawan'} )</Text>
                <Text style={styles.passTypeText}>Daily Visitor Pass</Text>
              </View>

              <Icon name="shield-star" size={36} color="#FF9933" />
            </View>

            {/* Main Body - Registration Number at top */}
            <View style={styles.mainBody}>
              <View style={styles.regNoRow}>
                <View style={styles.regNoLeft}>
                  <Text style={styles.regLabel}>Reg No पंजीकरण संख्या</Text>
                  <Text style={styles.regNumber}>{appointmentData.passNo}</Text>
                  {appointmentData.statusLabel ? (
                    <Text style={styles.statusBadge}>{appointmentData.statusLabel}</Text>
                  ) : null}
                </View>

                {/* Photo in top right corner */}
                <View style={styles.photoCorner}>
                  {personalDetails?.photoUri ? (
                    <Image
                      source={{ uri: personalDetails.photoUri }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Icon name="account" size={40} color="#94A3B8" />
                    </View>
                  )}
                </View>
              </View>

              {/* Content Area - Two Columns */}
              <View style={styles.contentArea}>
                {/* Left Column - Visitor & Meeting Details */}
                <View style={styles.leftColumn}>
                  {/* Visitor Details */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Visitor Details आगंतुक विवरण</Text>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Name नाम</Text>
                      <Text style={styles.fieldValue}>{appointmentData.visitorName || personalDetails?.name || '-'}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>F/S Name पिता/पति का नाम</Text>
                      <Text style={styles.fieldValue}>{appointmentData.fatherHusbandName || '-'}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Gender लिंग</Text>
                      <Text style={styles.fieldValue}>{appointmentData.gender || '-'}</Text>
                    </View>
                  </View>

                  {/* To Meet Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>To Meet मिलने को</Text>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Officer Name अधिकारी का नाम</Text>
                      <Text style={styles.fieldValue}>{appointmentData.officerName}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Approving Officer अनुमोदन अधिकारी</Text>
                      <Text style={styles.fieldValue} numberOfLines={2}>
                        {appointmentData.approvingOfficerName || appointmentData.officerName}
                        {appointmentData.designation ? ` (${appointmentData.designation})` : ''}
                      </Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Gadgets / गैजेट</Text>
                      <Text style={styles.fieldValue}>{appointmentData.vehicleType || '-'}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Purpose / उद्देश्य</Text>
                      <Text style={styles.fieldValue} numberOfLines={3}>
                        {(appointmentData.purpose || '-').toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Remark / टिप्पणी</Text>
                      <Text style={styles.fieldValue}>{appointmentData.remark || 'ONLINE PASS'}</Text>
                    </View>

                    <View style={styles.dataRow}>
                      <Text style={styles.fieldLabel}>Signature, Officer Visited: अधिकारी के हस्ताक्षर:</Text>
                      <View style={styles.signLine} />
                    </View>
                  </View>
                </View>

                {/* Right Column - Valid Duration, Address, Contact & QR */}
                <View style={styles.rightColumn}>
                  {/* Valid Duration Box */}
                  <View style={styles.validBox}>
                    <View style={styles.emblemCircle}>
                      <Icon name="seal" size={32} color="#0A2463" />
                    </View>
                    <Text style={styles.validLabel}>Valid Duration वैध अवधि :{appointmentData.time}</Text>
                    <Text style={styles.regDateLabel}>Reg Date पंजीकरण तिथि {appointmentData.registrationDate || appointmentData.date}</Text>
                    <Text style={styles.printedOn}>Printed On: {appointmentData.date} {appointmentData.time}</Text>
                  </View>

                  {/* Address & Contact */}
                  <View style={styles.contactSection}>
                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Address पता</Text>
                      <Text style={styles.contactValue} numberOfLines={3}>
                        {appointmentData.visitorAddress || personalDetails?.presentAddress || '-'}
                      </Text>
                    </View>

                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>Mobile No. मोबाइल नंबर</Text>
                      <Text style={styles.contactValue}>{appointmentData.mobileNo || personalDetails?.mobileNo || '-'}</Text>
                    </View>

                    <View style={styles.contactRow}>
                      <Text style={styles.contactLabel}>ID Details पहचान विवरण</Text>
                      <Text style={styles.contactValue}>
                        {personalDetails?.identityProof || '-'}{'\n'}
                        {maskIdNumber(appointmentData.idProofNo || personalDetails?.identityProofNumber)}
                      </Text>
                    </View>
                  </View>

                  {/* QR Code in bottom corner — API only returns qrCodeUrl when status is "Y" (Approved).
                      For Pending/Rejected/Cancelled, do NOT fabricate a QR — show a status message instead,
                      so the screen only ever reflects real API data, never dummy/placeholder data.
                      We generate the QR code locally on-device from the URL string the API gives us,
                      rather than trying to load/scrape an image from the government server — this is
                      simpler and fully reliable since it has no network dependency at render time. */}
                  <View style={styles.qrCorner}>
                    {showQr ? (
                      <View style={styles.qrWrapper}>
                        <QRCode
                          value={appointmentData.qrCodeUrl}
                          size={85}
                          backgroundColor="#FFFFFF"
                          color="#000000"
                        />
                      </View>
                    ) : (
                      <View style={styles.qrPendingBox}>
                        <Icon name="qrcode-remove" size={28} color="#94A3B8" />
                        <Text style={styles.qrPendingText}>
                          {appointmentData.statusLabel === 'Pending' || appointmentData.status === 'P'
                            ? 'QR will be generated after approval'
                            : appointmentData.statusLabel || 'QR not available'}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.validDateText}>Valid Date वैध तिथि :</Text>
                    <Text style={styles.validDateValue}>{appointmentData.date}</Text>
                  </View>

                  {/* Reception Info */}
                  <View style={styles.receptionInfo}>
                    <Text style={styles.receptionTitle}>Sr. Reception/Reception Officer</Text>
                    <Text style={styles.receptionHindi}>वरिष्ठ स्वागत स्वागत अधिकारी</Text>
                    <Text style={styles.gateText}>{appointmentData.agency || appointmentData.department}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <LinearGradient
                colors={['#00BCD4', '#0097A7']}
                style={styles.instructionHeader}
              >
                <Text style={styles.instructionTitle}>INSTRUCTIONS/दिशा निर्देश</Text>
              </LinearGradient>

              <View style={styles.instructionContent}>
                <Text style={styles.hindiText}>
                  जिस कार्यालय के लिए पास आवंटित है उसके अलावा आगंतुक सरकारी भवन के अन्य कार्यालयों में ना घूमें और मुलाकात के पश्चात पास को सुरक्षाकर्मी के पास अवश्य जमा करायें।
                </Text>
                <Text style={styles.englishText}>
                  VISITOR SHOULD NOT ROAM AROUND THE OFFICES IN THE GOVERNMENT BUILDING EXCEPT THE OFFICE TO BE VISITED AND HE/SHE MUST RETURN THE PASS TO SECURITY PERSONNEL AFTER THE VISIT
                </Text>
              </View>
            </View>

            {/* Footer */}
            <LinearGradient colors={['#00BCD4', '#0097A7']} style={styles.footer}>
              <Text style={styles.footerText}>MINISTRY OF HOME AFFAIRS • RECEPTION ORGANISATION</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {isZoomed && (
          <TouchableOpacity style={styles.resetZoomBtn} onPress={resetZoom}>
            <Feather name="minimize-2" size={16} color="#FFFFFF" />
            <Text style={styles.resetZoomText}>Reset Zoom</Text>
          </TouchableOpacity>
        )}

        {/* Bottom NIC Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoRow}>
            <Icon name="flag" size={16} color="#FF9933" />
            <Text style={styles.infoText}>A Digital India Initiative by Government of India</Text>
          </View>

          <Text style={styles.copyright}>Copyright © 2019 by NIC. All rights reserved.</Text>

          <View style={styles.nicSection}>
            <View style={styles.nicBadge}>
              <Text style={styles.nicText}>NIC</Text>
            </View>
            <View>
              <Text style={styles.nicName}>NATIONAL</Text>
              <Text style={styles.nicName}>INFORMATICS</Text>
              <Text style={styles.nicName}>CENTRE</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#3477eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  inlineErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
  },
  zoomHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#3477eb',
    fontWeight: '600',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  statusBadge: {
    fontSize: 7,
    fontWeight: '700',
    color: '#0EA5D1',
    marginTop: 3,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  zoomWrapper: {
    margin: 16,
    // Allows the scaled card to visually extend beyond its own box
    overflow: 'visible',
  },
  passCard: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  topBanner: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  logoTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A2463',
  },
  logoSubtitle: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '500',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  buildingText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  passTypeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0A2463',
  },
  mainBody: {
    padding: 12,
  },
  regNoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  regNoLeft: {
    flex: 1,
  },
  regLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  regNumber: {
    fontSize: 8,
    color: '#0A2463',
    fontWeight: '700',
  },
  photoCorner: {
    marginLeft: 10,
  },
  photo: {
    width: 85,
    height: 100,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  photoPlaceholder: {
    width: 85,
    height: 100,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    flex: 1.5,
  },
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A2463',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 6,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '600',
    width: 90,
    lineHeight: 9,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 9.5,
  },
  signLine: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#CBD5E1',
    marginTop: 4,
  },
  validBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emblemCircle: {
    marginBottom: 6,
  },
  validLabel: {
    fontSize: 7.5,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 3,
  },
  regDateLabel: {
    fontSize: 7,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  printedOn: {
    fontSize: 6,
    color: '#64748B',
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 5,
    alignItems: 'flex-start',
  },
  contactLabel: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    width: 38,
    lineHeight: 8,
    flexShrink: 0,
  },
  contactValue: {
    fontSize: 6.5,
    color: '#0A2463',
    fontWeight: '700',
    flex: 1,
    lineHeight: 8.5,
  },
  qrCorner: {
    alignItems: 'center',
    marginBottom: 10,
  },
  qrWrapper: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPendingBox: {
    width: 97,
    height: 97,
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  qrPendingText: {
    fontSize: 6,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 8,
  },
  validDateText: {
    fontSize: 6.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  validDateValue: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0A2463',
  },
  receptionInfo: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  receptionTitle: {
    fontSize: 6,
    color: '#0A2463',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 8,
  },
  receptionHindi: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 8,
    marginBottom: 3,
  },
  gateText: {
    fontSize: 6,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 1,
    textAlign: 'center',
  },
  instructions: {
    marginTop: 6,
  },
  instructionHeader: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  instructionContent: {
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  hindiText: {
    fontSize: 6.5,
    color: '#0A2463',
    textAlign: 'center',
    lineHeight: 9,
    marginBottom: 6,
    fontWeight: '600',
  },
  englishText: {
    fontSize: 6,
    color: '#0EA5D1',
    textAlign: 'center',
    lineHeight: 8.5,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resetZoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#3477eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 8,
  },
  resetZoomText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomInfo: {
    backgroundColor: '#3477eb',
    margin: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  copyright: {
    fontSize: 7.5,
    color: '#E2E8F0',
    marginVertical: 10,
  },
  nicSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 6,
  },
  nicBadge: {
    backgroundColor: '#3477eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  nicText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  nicName: {
    fontSize: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default TodayAppointmentDetailScreen;