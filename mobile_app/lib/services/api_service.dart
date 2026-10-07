import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Web brauzerda ishlatish uchun localhost API
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  static String? accessToken;
  static String? refreshToken;
  static Map<String, dynamic>? currentUser;

  static Map<String, String> get headers {
    final map = {'Content-Type': 'application/json'};
    if (accessToken != null) {
      map['Authorization'] = 'Bearer $accessToken';
    }
    return map;
  }

  // 1.1 Passport Login
  static Future<Map<String, dynamic>> passportLogin(String passport, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/passport-login/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'passport_series': passport, 'password': password}),
    );
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  // 1.1 Face ID tekshiruvi -> 10 kunlik token
  static Future<Map<String, dynamic>> verifyFaceId(int userId, bool liveness) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/face-verify/'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'user_id': userId, 'liveness_verified': liveness}),
    );
    final data = jsonDecode(utf8.decode(response.bodyBytes));
    if (response.statusCode == 200) {
      accessToken = data['access'];
      refreshToken = data['refresh'];
      currentUser = data['user'];
    }
    return data;
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

  // 2.5 Baho qo'yish (va Yulduz berish)
  static Future<Map<String, dynamic>> addGrade({
    required int lessonId,
    required int studentId,
    required int score,
    required String gradeType,
    required String comment,
    bool isStarred = false,
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
        'is_starred': isStarred,
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
}
