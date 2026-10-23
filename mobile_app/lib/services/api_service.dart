import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String serverUrl = 'https://epinions-charlotte-theories-exec.trycloudflare.com';

  static String get baseUrl {
    return '$serverUrl/api';
  }

  static String? accessToken;
  static String? refreshToken;
  static Map<String, dynamic>? currentUser;
  static Map<String, dynamic>? schoolConfig;

  static String get schoolName {
    return (schoolConfig?['school_name'] as String?) ??
        (currentUser?['school_name'] as String?) ??
        'Idrok Edu';
  }

  static String get groupTermSingular {
    return (schoolConfig?['labels']?['group_singular'] as String?) ??
        ((schoolConfig?['group_term'] == 'GURUH') ? 'Guruh' : 'Sinf');
  }

  static String get groupTermPlural {
    return (schoolConfig?['labels']?['group_plural'] as String?) ??
        ((schoolConfig?['group_term'] == 'GURUH') ? 'Guruhlar' : 'Sinflar');
  }

  static String get myGroupsTitle {
    return (schoolConfig?['labels']?['my_groups'] as String?) ??
        ((schoolConfig?['group_term'] == 'GURUH') ? 'Guruhlarim' : 'Sinflarim');
  }

  static String get advisorLabel {
    return (schoolConfig?['labels']?['advisor_label'] as String?) ??
        ((schoolConfig?['group_term'] == 'GURUH') ? 'Guruh rahbari' : 'Sinf rahbari');
  }

  static String get lessonTermSingular {
    return (schoolConfig?['labels']?['lesson_singular'] as String?) ??
        ((schoolConfig?['lesson_term'] == 'PARA') ? 'Para' : 'Dars');
  }

  static String get lessonTermPlural {
    return (schoolConfig?['labels']?['lesson_plural'] as String?) ??
        ((schoolConfig?['lesson_term'] == 'PARA') ? 'Paralar' : 'Darslar');
  }

  static String get studentTermSingular {
    return (schoolConfig?['labels']?['student_singular'] as String?) ??
        ((schoolConfig?['student_term'] == 'TALABA') ? 'Talaba' : "O'quvchi");
  }

  static String get studentTermPlural {
    return (schoolConfig?['labels']?['student_plural'] as String?) ??
        ((schoolConfig?['student_term'] == 'TALABA') ? 'Talabalar' : "O'quvchilar");
  }

  static String formatClassName(String? raw) {
    if (raw == null || raw.trim().isEmpty || raw == '-' || raw == 'Guruhsiz' || raw == 'Sinfsiz') {
      return (schoolConfig?['group_term'] == 'GURUH') ? 'Guruhsiz' : 'Sinfsiz';
    }
    String s = raw.trim();
    for (final suffix in [' sinf', '-sinf', ' guruh', '-guruh', ' Sinf', ' Guruh']) {
      if (s.toLowerCase().endsWith(suffix.toLowerCase())) {
        s = s.substring(0, s.length - suffix.length).trim();
      }
    }
    final unit = (schoolConfig?['group_term'] == 'GURUH') ? 'guruh' : 'sinf';
    return '$s $unit';
  }

  static Future<Map<String, dynamic>?> fetchSchoolConfig(String schoolId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/school-config/?school_id=$schoolId')).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (data is Map<String, dynamic> && data['school_id'] != null) {
          schoolConfig = data;
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  static Map<String, String> get headers {
    final map = {'Content-Type': 'application/json'};
    if (accessToken != null) {
      map['Authorization'] = 'Bearer $accessToken';
    }
    return map;
  }

  static Future<void> saveSession(
    String access,
    String? refresh,
    Map<String, dynamic>? user,
    Map<String, dynamic>? config,
  ) async {
    accessToken = access;
    refreshToken = refresh;
    currentUser = user;
    if (config != null) schoolConfig = config;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_access_token', access);
      if (refresh != null) await prefs.setString('auth_refresh_token', refresh);
      if (user != null) await prefs.setString('auth_current_user', jsonEncode(user));
      if (schoolConfig != null) await prefs.setString('auth_school_config', jsonEncode(schoolConfig));
    } catch (_) {}
  }

  static Future<bool> restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final access = prefs.getString('auth_access_token');
      final userJson = prefs.getString('auth_current_user');
      final configJson = prefs.getString('auth_school_config');
      if (access != null && userJson != null) {
        accessToken = access;
        refreshToken = prefs.getString('auth_refresh_token');
        try {
          currentUser = jsonDecode(userJson);
        } catch (_) {}
        if (configJson != null) {
          try {
            schoolConfig = jsonDecode(configJson);
          } catch (_) {}
        }
        return true;
      }
    } catch (_) {}
    return false;
  }

  // 1.1 Login (5 xonali ID, Username yoki Pasport)
  static Future<Map<String, dynamic>> login(String loginId, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/passport-login/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'login_id': loginId, 'passport_series': loginId, 'password': password}),
    ).timeout(const Duration(seconds: 12));
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (data is Map<String, dynamic>) {
      if (data['school_config'] != null) {
        schoolConfig = Map<String, dynamic>.from(data['school_config']);
      }
      if (data['access'] != null) {
        await saveSession(
          data['access'],
          data['refresh'],
          data['user'] is Map<String, dynamic> ? data['user'] : null,
          data['school_config'] is Map<String, dynamic> ? data['school_config'] : null,
        );
      }
    }
    return data;
  }

  // 1.1 Face ID tekshiruvi -> 10 kunlik token (real rasm taqqoslash bilan)
  static Future<Map<String, dynamic>> verifyFaceId(int userId, bool liveness, {String? faceImageB64}) async {
    final payload = <String, dynamic>{
      'user_id': userId,
      'liveness_verified': liveness,
    };
    if (faceImageB64 != null) {
      payload['face_image'] = faceImageB64;
    }
    final response = await http.post(
      Uri.parse('$baseUrl/auth/face-verify/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 200) {
      Map<String, dynamic>? cfg;
      if (data['school_config'] != null) {
        cfg = Map<String, dynamic>.from(data['school_config']);
      } else if (data['user'] != null && data['user']['school_config'] != null) {
        cfg = Map<String, dynamic>.from(data['user']['school_config']);
      }
      await saveSession(
        data['access'],
        data['refresh'],
        data['user'] is Map<String, dynamic> ? data['user'] : null,
        cfg,
      );
    }
    return data;
  }

  // Oylik to'liq davomat jadvali (har bir dars va aniq kirish vaqti bilan)
  static Future<Map<String, dynamic>?> getStudentMonthlyAttendance({int? year, int? month}) async {
    try {
      final query = <String>[];
      if (year != null) query.add('year=$year');
      if (month != null) query.add('month=$month');
      final qStr = query.isNotEmpty ? '?${query.join('&')}' : '';
      final response = await http.get(
        Uri.parse('$baseUrl/student/monthly-attendance/$qStr'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  // O'quvchining to'liq profil ma'lumotlari (baza bilan bog'langan)
  static Future<Map<String, dynamic>?> getStudentProfile() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/student/profile/'), headers: headers).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (data is Map<String, dynamic>) {
          if (data['school_config'] != null) {
            schoolConfig = Map<String, dynamic>.from(data['school_config']);
          }
          if (data['student'] != null && data['student'] is Map) {
            currentUser ??= {};
            final sMap = Map<String, dynamic>.from(data['student']);
            sMap.forEach((k, v) {
              if (v != null) currentUser![k] = v;
            });
          }
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  // 1.2 O'quvchi bosh sahifasi (Bugungi darslar, real vaqt statusi, statistika, haftalik jadval)
  static Future<Map<String, dynamic>?> getStudentDashboardSummary() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/student/dashboard-summary/'), headers: headers).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (data is Map<String, dynamic>) {
          if (data['school_config'] != null) {
            schoolConfig = Map<String, dynamic>.from(data['school_config']);
          }
          if (data['student'] != null && data['student'] is Map) {
            currentUser ??= {};
            final sMap = Map<String, dynamic>.from(data['student']);
            sMap.forEach((k, v) {
              if (v != null) currentUser![k] = v;
            });
          }
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  // Haftalik dars jadvali
  static Future<List<dynamic>> getWeeklySchedule({int? classId}) async {
    try {
      final summary = await getStudentDashboardSummary();
      if (summary != null && summary['weekly_schedules'] != null) {
        return summary['weekly_schedules'] as List<dynamic>;
      }
      final url = classId != null ? '$baseUrl/schedule/?class_id=$classId' : '$baseUrl/schedule/';
      final response = await http.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        final decoded = jsonDecode(utf8.decode(response.bodyBytes));
        if (decoded is List) return decoded;
        if (decoded is Map && decoded['schedules'] is List) return decoded['schedules'] as List<dynamic>;
      }
    } catch (_) {}
    return [];
  }

  // 1.2 Bugungi darslar
  static Future<List<dynamic>> getTodayLessons() async {
    final response = await http.get(Uri.parse('$baseUrl/lessons/today/'), headers: headers);
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return [];
  }

  // 1.3 Dinamik 20s QR kod
  static Future<Map<String, dynamic>> generateDynamicQR() async {
    final response = await http.get(Uri.parse('$baseUrl/qr/generate/'), headers: headers);
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 1.3 /lesson-room statusi
  static Future<Map<String, dynamic>> getLessonRoom(int lessonId) async {
    final response = await http.get(Uri.parse('$baseUrl/lessons/$lessonId/room/'), headers: headers);
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 1.3 Uyga vazifa topshirish
  static Future<Map<String, dynamic>> submitHomework(int lessonId, String text) async {
    final response = await http.post(
      Uri.parse('$baseUrl/lessons/$lessonId/homework/'),
      headers: headers,
      body: jsonEncode({'text_content': text}),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 1.4 Baholar jurnali
  static Future<List<dynamic>> getMyGrades() async {
    final response = await http.get(Uri.parse('$baseUrl/grades/my/'), headers: headers);
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return [];
  }

  // 2.4 Jonli dars tafsilotlari (Ustoz uchun)
  static Future<Map<String, dynamic>> getTeacherLiveLesson(int lessonId) async {
    final response = await http.get(Uri.parse('$baseUrl/lessons/$lessonId/teacher-summary/'), headers: headers);
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 2.0 O'qituvchi bosh sahifasi (Bugungi darslar, real davomat, statistika, haftalik jadval, sinflar)
  static Future<Map<String, dynamic>?> getTeacherDashboardSummary() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/teacher/dashboard-summary/'), headers: headers).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (data is Map<String, dynamic>) {
          if (data['school_config'] != null) {
            schoolConfig = Map<String, dynamic>.from(data['school_config']);
          }
          if (data['teacher'] != null && data['teacher'] is Map) {
            currentUser ??= {};
            final tMap = Map<String, dynamic>.from(data['teacher']);
            tMap.forEach((k, v) {
              if (v != null) currentUser![k] = v;
            });
          }
          return data;
        }
      }
    } catch (_) {}
    return null;
  }

  // 2.1 Sinf/Guruh Jurnali (O'quvchilar ro'yxati, kunlik/oylik davomat, o'rtacha baho)
  static Future<Map<String, dynamic>?> getTeacherClassJournal({int? classId}) async {
    try {
      final url = classId != null 
          ? '$baseUrl/teacher/class-journal/?class_id=$classId' 
          : '$baseUrl/teacher/class-journal/';
      final response = await http.get(Uri.parse(url), headers: headers);
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  // 2.2 Barcha o'quvchilarni bir bosishda davomatdan o'tkazish
  static Future<Map<String, dynamic>> bulkMarkAttendance({
    required int lessonId,
    List<int>? studentIds,
    bool allPresent = true,
  }) async {
    final body = <String, dynamic>{
      'lesson_id': lessonId,
      'all_present': allPresent,
    };
    if (studentIds != null) {
      body['student_ids'] = studentIds;
    }
    final response = await http.post(
      Uri.parse('$baseUrl/attendance/bulk-mark/'),
      headers: headers,
      body: jsonEncode(body),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 2.3 Dars mavzusi va uyga vazifani yangilash
  static Future<Map<String, dynamic>> updateLessonContent({
    required int lessonId,
    String? topic,
    String? homeworkDescription,
    String? materialsUrl,
  }) async {
    final body = <String, dynamic>{};
    if (topic != null) body['topic'] = topic;
    if (homeworkDescription != null) body['homework_description'] = homeworkDescription;
    if (materialsUrl != null) body['materials_url'] = materialsUrl;

    final response = await http.post(
      Uri.parse('$baseUrl/lessons/$lessonId/update-content/'),
      headers: headers,
      body: jsonEncode(body),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 2.4 QR skanerlash / qo'lda davomat belgilash
  static Future<Map<String, dynamic>> scanAttendance({
    required int lessonId,
    String? qrToken,
    int? studentId,
  }) async {
    final body = {'lesson_id': lessonId};
    if (qrToken != null) body['qr_token'] = qrToken as dynamic;
    if (studentId != null) body['student_id'] = studentId as dynamic;

    final response = await http.post(
      Uri.parse('$baseUrl/attendance/scan/'),
      headers: headers,
      body: jsonEncode(body),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 2.5 Baho qo'yish
  static Future<Map<String, dynamic>> addGrade({
    required int lessonId,
    required int studentId,
    required int score,
    required String gradeType,
    required String comment,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/grades/add/'),
      headers: headers,
      body: jsonEncode({
        'lesson_id': lessonId,
        'student_id': studentId,
        'score': score,
        'grade_type': gradeType,
        'comment': comment,
      }),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // Davomatni yakunlash (Dars jarayoniga o'tish)
  static Future<Map<String, dynamic>> finishAttendance(int lessonId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/lessons/$lessonId/finish-attendance/'),
      headers: headers,
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // Darsni yakunlash (100% baholash tekshiruvi bilan)
  static Future<Map<String, dynamic>> completeLesson(int lessonId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/lessons/$lessonId/complete/'),
      headers: headers,
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }


  static String get shooldexUrl {
    return '$serverUrl/shooldex';
  }

  // 2.3 Ustoz o'quvchilar parolini boshqarishi
  static Future<List<dynamic>> getStudentsPasswords() async {
    final response = await http.get(Uri.parse('$baseUrl/teacher/manage-passwords/'), headers: headers);
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return [];
  }

  static Future<Map<String, dynamic>> resetStudentPassword(int studentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/teacher/manage-passwords/'),
      headers: headers,
      body: jsonEncode({'student_id': studentId}),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // =========================================================================
  // 3. AQLLI DOSKA (SHOOLDEX) API METODLARI
  // =========================================================================

  static String extractDeviceToken(String raw) {
    final trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        final decoded = jsonDecode(trimmed);
        if (decoded is Map) {
          return (decoded['device_token'] ?? decoded['token'] ?? trimmed).toString();
        }
      } catch (_) {}
    }
    if (trimmed.contains('token=')) {
      final uri = Uri.tryParse(trimmed);
      if (uri != null && uri.queryParameters['token'] != null) {
        return uri.queryParameters['token']!;
      }
    }
    return trimmed;
  }

  // 3.1 Doskaga ulanish (QR Skanerlash) -> POST /shooldex/session/connect/
  static Future<Map<String, dynamic>> connectToBoard(String rawQrToken) async {
    final cleanToken = extractDeviceToken(rawQrToken);
    final response = await http.post(
      Uri.parse('$shooldexUrl/session/connect/'),
      headers: headers,
      body: jsonEncode({'device_token': cleanToken}),
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (data is Map<String, dynamic>) {
      data['statusCode'] = response.statusCode;
      return data;
    }
    return {'statusCode': response.statusCode, 'detail': 'Xatolik yuz berdi'};
  }

  // 3.2 Sessiya holati (ulanganmi?) -> GET /shooldex/my-session/
  static Future<Map<String, dynamic>> getMyBoardSession() async {
    final response = await http.get(
      Uri.parse('$shooldexUrl/my-session/'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return {'status': 'NO_SESSION', 'session': null};
  }

  // 3.3 Qurilma ma'lumoti va Gemini API kaliti -> GET /shooldex/device/<token>/
  static Future<Map<String, dynamic>> getBoardDeviceInfo(String deviceToken) async {
    final response = await http.get(
      Uri.parse('$shooldexUrl/device/$deviceToken/'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return {};
  }

  // 3.4 Saqlash buyrug'i yuborish -> POST /shooldex/session/<session_id>/request-save/
  static Future<Map<String, dynamic>> requestBoardSave(int sessionId) async {
    final response = await http.post(
      Uri.parse('$shooldexUrl/session/$sessionId/request-save/'),
      headers: headers,
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (data is Map<String, dynamic>) {
      data['statusCode'] = response.statusCode;
      return data;
    }
    return {'statusCode': response.statusCode};
  }

  // 3.5 Sessiyani uzish -> POST /shooldex/session/<session_id>/disconnect/
  static Future<Map<String, dynamic>> disconnectBoard(int sessionId) async {
    final response = await http.post(
      Uri.parse('$shooldexUrl/session/$sessionId/disconnect/'),
      headers: headers,
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (data is Map<String, dynamic>) {
      data['statusCode'] = response.statusCode;
      return data;
    }
    return {'statusCode': response.statusCode};
  }

  // 3.6 AI savol / Canvas saqlash -> POST /shooldex/canvas/save/
  static Future<Map<String, dynamic>> saveBoardCanvas({
    required int sessionId,
    required String deviceToken,
    required List<Map<String, dynamic>> canvases,
  }) async {
    final response = await http.post(
      Uri.parse('$shooldexUrl/canvas/save/'),
      headers: headers,
      body: jsonEncode({
        'session_id': sessionId,
        'device_token': deviceToken,
        'canvases': canvases,
      }),
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (data is Map<String, dynamic>) {
      data['statusCode'] = response.statusCode;
      return data;
    }
    return {'statusCode': response.statusCode};
  }

  // 3.7 Ustozning saqlangan doska listlarini yuklash -> GET /shooldex/canvas/load/?teacher_id=<id>
  static Future<List<dynamic>> loadBoardCanvases(int teacherId) async {
    final response = await http.get(
      Uri.parse('$shooldexUrl/canvas/load/?teacher_id=$teacherId'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(utf8.decode(response.bodyBytes));
    }
    return [];
  }

  // 4.1 Checkpoint Kiosk: O'quvchilarni F.I.SH yoki ID bo'yicha qidirish
  static Future<List<dynamic>> searchCheckpointStudents(String query, {String? schoolId}) async {
    final sid = schoolId ?? currentUser?['school_id']?.toString() ?? '1';
    final url = Uri.parse('$baseUrl/checkpoint/search-students/?school_id=$sid&q=${Uri.encodeComponent(query)}');
    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        return (data['results'] as List<dynamic>?) ?? [];
      }
    } catch (_) {}
    return [];
  }

  // 4.2 Checkpoint Kiosk: QR kod orqali maktabga kiritish
  static Future<Map<String, dynamic>> verifyCheckpointQR(String qrToken, {String? schoolId, String direction = 'IN'}) async {
    final sid = schoolId ?? currentUser?['school_id']?.toString() ?? '1';
    final url = Uri.parse('$baseUrl/checkpoint/verify-qr/');
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'qr_token': qrToken,
          'school_id': sid,
          'direction': direction,
        }),
      );
      return jsonDecode(utf8.decode(response.bodyBytes));
    } catch (e) {
      return {'success': false, 'detail': 'Server bilan bog\'lanishda xatolik: $e'};
    }
  }

  // 4.3 Checkpoint Kiosk: Olingan yuz rasmini 3x4 rasm bilan biometrik solishtirish
  static Future<Map<String, dynamic>> verifyCheckpointFace(int studentId, String faceImageB64, {String? schoolId, String direction = 'IN'}) async {
    final sid = schoolId ?? currentUser?['school_id']?.toString() ?? '1';
    final url = Uri.parse('$baseUrl/checkpoint/verify-face/');
    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'student_id': studentId,
          'face_image': faceImageB64,
          'school_id': sid,
          'direction': direction,
        }),
      );
      return jsonDecode(utf8.decode(response.bodyBytes));
    } catch (e) {
      return {'success': false, 'match': false, 'detail': 'Server bilan bog\'lanishda xatolik: $e'};
    }
  }

  // 4.4 Checkpoint Kiosk: Bugungi statistika va oxirgi kirishlar logi
  static Future<Map<String, dynamic>?> getCheckpointStats({String? schoolId}) async {
    final sid = schoolId ?? currentUser?['school_id']?.toString() ?? '1';
    final url = Uri.parse('$baseUrl/checkpoint/today-stats/?school_id=$sid');
    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        return jsonDecode(utf8.decode(response.bodyBytes));
      }
    } catch (_) {}
    return null;
  }

  // 3.8 Tizimdan chiqish (Logout)
  static Future<void> logout() async {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    schoolConfig = null;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_access_token');
      await prefs.remove('auth_refresh_token');
      await prefs.remove('auth_current_user');
      await prefs.remove('auth_school_config');
    } catch (_) {}
  }
}

