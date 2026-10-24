import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/subscriber_model.dart';

class EarthlinkApiService {
  static const String baseUrl = 'https://ubapi.earthlink.iq/api/user';
  static const String tokenKey = 'EL_AUTH_TOKEN';

  // Active token in memory
  String? _authToken;
  String? get authToken => _authToken;

  // Initialize and load saved token
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString(tokenKey);
  }

  // 1. Authenticate with Earthlink User Credentials (grant_type=password)
  Future<bool> login(String username, String password) async {
    try {
      final uri = Uri.parse('$baseUrl/Token');
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://user.earthlink.iq',
          'Referer': 'https://user.earthlink.iq/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        },
        body: {
          'grant_type': 'password',
          'username': username,
          'password': password,
          'Logintype': '0',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['access_token'] != null) {
          _authToken = data['access_token'].toString();
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(tokenKey, _authToken!);
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // 2. Check Session Validity
  Future<bool> checkSession() async {
    if (_authToken == null) return false;
    try {
      final uri = Uri.parse('$baseUrl/CheckSession');
      final response = await http.post(
        uri,
        headers: {
          'Authorization': 'bearer $_authToken',
          'Content-Length': '0',
          'Origin': 'https://user.earthlink.iq',
          'Referer': 'https://user.earthlink.iq/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        },
      );
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 3. Get Real-Time Subscriber Data in Arabic (GetUserDataAr)
  Future<SubscriberModel?> fetchUserData() async {
    if (_authToken == null) return null;

    try {
      final uri = Uri.parse('$baseUrl/GetUserDataAr');
      final response = await http.get(
        uri,
        headers: {
          'Authorization': 'bearer $_authToken',
          'Content-Type': 'application/json; charset=utf-8',
          'Origin': 'https://user.earthlink.iq',
          'Referer': 'https://user.earthlink.iq/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        return SubscriberModel.fromJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Logout
  Future<void> logout() async {
    _authToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(tokenKey);
  }
}
