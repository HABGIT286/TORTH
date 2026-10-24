import 'package:flutter/material.dart';
import '../models/subscriber_model.dart';
import '../services/earthlink_api_service.dart';
import '../widgets/dynamic_island.dart';
import '../widgets/hero_subscription_card.dart';
import '../widgets/network_quality_card.dart';
import '../widgets/bottom_nav_bar.dart';
import 'report_screen.dart';
import 'alerts_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  final EarthlinkApiService apiService;
  final VoidCallback onLogout;

  const HomeScreen({
    super.key,
    required this.apiService,
    required this.onLogout,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  bool _hasActiveAlert = true;
  late SubscriberModel _subscriberData;
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _subscriberData = SubscriberModel.initial();
    _refreshData();
  }

  Future<void> _refreshData() async {
    setState(() => _isRefreshing = true);
    final fresh = await widget.apiService.fetchUserData();
    if (mounted) {
      setState(() {
        if (fresh != null) _subscriberData = fresh;
        _isRefreshing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF06030C),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // 1. Dynamic Island at the top
                const DynamicIslandWidget(isOnline: true),

                // 2. Custom App Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // User Avatar & Name
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            padding: const EdgeInsets.all(2),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF9333EA), Color(0xFF38BDF8)],
                              ),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Image.network(
                                _subscriberData.accountImagePath,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(
                                  Icons.person,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'مرحباً بك مجدداً 👋',
                                style: TextStyle(fontSize: 11, color: Colors.white60),
                              ),
                              Text(
                                _subscriberData.fullName,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      // Notification Bell with Active Indicator Badge
                      IconButton(
                        onPressed: () => setState(() => _currentTabIndex = 2),
                        icon: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            const Icon(Icons.notifications_none_rounded, color: Colors.white70),
                            if (_hasActiveAlert)
                              Positioned(
                                top: -2,
                                right: -2,
                                child: Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF38BDF8),
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(color: Color(0xFF38BDF8), blurRadius: 6),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // 3. Tab Views Content
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: Padding(
                      key: ValueKey<int>(_currentTabIndex),
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: _buildCurrentTab(),
                    ),
                  ),
                ),
              ],
            ),

            // 4. Floating Curved Luxury Bottom Navigation Bar
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: LuxuryBottomNavBar(
                currentIndex: _currentTabIndex,
                onTabSelected: (idx) => setState(() => _currentTabIndex = idx),
                hasActiveAlert: _hasActiveAlert,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentTab() {
    switch (_currentTabIndex) {
      case 0:
        return SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 90),
          child: Column(
            children: [
              HeroSubscriptionCard(
                data: _subscriberData,
                onNavigateToData: () => setState(() => _currentTabIndex = 1),
                onNavigateToAlerts: () => setState(() => _currentTabIndex = 2),
              ),
              const SizedBox(height: 16),
              NetworkQualityCard(userIP: _subscriberData.userIP),
            ],
          ),
        );
      case 1:
        return ReportScreen(
          data: _subscriberData,
          onRefresh: _refreshData,
        );
      case 2:
        return AlertsScreen(
          hasActiveSchedule: _hasActiveAlert,
          onToggleSchedule: (active) => setState(() => _hasActiveAlert = active),
        );
      case 3:
        return SettingsScreen(onLogout: widget.onLogout);
      default:
        return const SizedBox.shrink();
    }
  }
}
