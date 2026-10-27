import 'dart:async';
import 'dart:convert';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

// ============================================================================
// 🚀 EARTHLINK VIP - تطبيق فلاتر دارت المتكامل والفاخر
// التصميم: Glassmorphism + Claymorphism + Neumorphism + أنيميشن مائي + ذكاء اصطناعي
// ============================================================================

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF06030C),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const EarthlinkVipDartApp());
}

// ----------------------------------------------------------------------------
// الثيمات والألوان الملكية
// ----------------------------------------------------------------------------
class AppTheme {
  static const Color background = Color(0xFF06030C);
  static const Color surface = Color(0xFF0D061A);
  static const Color cardGlass = Color(0x1AFFFFFF);
  static const Color primaryPurple = Color(0xFFA855F7);
  static const Color primaryCyan = Color(0xFF06B6D4);
  static const Color accentNeon = Color(0xFF38BDF8);
  static const Color goldVip = Color(0xFFFFD700);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
}

// ----------------------------------------------------------------------------
// التطبيق الرئيسي
// ----------------------------------------------------------------------------
class EarthlinkVipDartApp extends StatefulWidget {
  const EarthlinkVipDartApp({super.key});

  @override
  State<EarthlinkVipDartApp> createState() => _EarthlinkVipDartAppState();
}

class _EarthlinkVipDartAppState extends State<EarthlinkVipDartApp> {
  ThemeMode _themeMode = ThemeMode.dark;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Earthlink VIP - دارت',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppTheme.background,
        primaryColor: AppTheme.primaryPurple,
        fontFamily: 'Cairo',
        colorScheme: const ColorScheme.dark(
          primary: AppTheme.primaryPurple,
          secondary: AppTheme.primaryCyan,
          surface: AppTheme.surface,
        ),
      ),
      home: const Directionality(
        textDirection: TextDirection.rtl,
        child: EarthlinkMainNavigation(),
      ),
    );
  }
}

// ----------------------------------------------------------------------------
// شاشة الملاحة الرئيسية مع القائمة الجانبية والتبويبات
// ----------------------------------------------------------------------------
class EarthlinkMainNavigation extends StatefulWidget {
  const EarthlinkMainNavigation({super.key});

  @override
  State<EarthlinkMainNavigation> createState() => _EarthlinkMainNavigationState();
}

class _EarthlinkMainNavigationState extends State<EarthlinkMainNavigation>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // بيانات المستخدم المتصل
  final String _username = "erth_vip_user_99";
  final String _subscriberId = "ERTH-982104";
  final String _planName = "إيرثلنك توربو VIP (50 Mbps)";
  double _remainingGb = 168.4;
  final double _totalGb = 250.0;
  int _remainingDays = 14;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.background,
      drawer: _buildLuxuryDrawer(),
      body: Stack(
        children: [
          // خلفية متدرجة فخمة مع جسيمات توهج
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.primaryPurple.withOpacity(0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            right: -80,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppTheme.primaryCyan.withOpacity(0.2),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // المحتوى التفاعلي حسب التبويب
          SafeArea(
            child: Column(
              children: [
                _buildTopAppBar(),
                Expanded(
                  child: IndexedStack(
                    index: _currentIndex,
                    children: [
                      _buildDashboardTab(),
                      _buildGlassyV2Tab(),
                      _buildAiFeaturesTab(),
                      _buildSpeedTestTab(),
                      _buildAlertsTab(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildLuxuryBottomNav(),
    );
  }

  // شريط علوي فخم Glassmorphic
  Widget _buildTopAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        borderRadius: 20,
        child: Row(
          children: [
            // زر فتح القائمة الجانبية الفاخرة
            IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 28),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            ),
            const SizedBox(width: 8),
            // الشعار والعنوان
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Text(
                        "إيرثلنك ",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppTheme.primaryPurple, AppTheme.primaryCyan],
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          "VIP AI",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _subscriberId,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.6),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            // أيقونة الاتصال بالشبكة
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.success.withOpacity(0.15),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.success.withOpacity(0.4)),
              ),
              child: const Icon(Icons.wifi_rounded, color: AppTheme.success, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  // --------------------------------------------------------------------------
  // تبويب 1: لوحة التحكم والعداد المائي
  // --------------------------------------------------------------------------
  Widget _buildDashboardTab() {
    double percentage = (_remainingGb / _totalGb).clamp(0.0, 1.0);

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // كرت العداد المائي الفاخر
          GlassCard(
            borderRadius: 28,
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "الرصيد المتبقي",
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              "${_remainingGb.toStringAsFixed(1)} ",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              "/ $_totalGb جيجابايت",
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.5),
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryPurple.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.primaryPurple.withOpacity(0.4)),
                      ),
                      child: Text(
                        "باقٍ $_remainingDays يوم",
                        style: const TextStyle(
                          color: AppTheme.primaryPurple,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // العداد المائي الدائري التفاعلي
                SizedBox(
                  height: 190,
                  width: 190,
                  child: WaterWaveWidget(
                    percentage: percentage,
                    centerText: "${(percentage * 100).toInt()}%",
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  "الباقة نشطة ومحمية بالذكاء الاصطناعي",
                  style: TextStyle(color: Colors.white60, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // شبكة الإجراءات السريعة
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.bolt_rounded,
                  title: "فحص السرعة",
                  color: AppTheme.primaryCyan,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.psychology_rounded,
                  title: "التحسين الذكي",
                  color: AppTheme.primaryPurple,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.notifications_active_rounded,
                  title: "التنبيهات",
                  color: AppTheme.goldVip,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // كرت تفاصيل الاشتراك
          GlassCard(
            borderRadius: 24,
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: AppTheme.primaryCyan, size: 20),
                    SizedBox(width: 8),
                    Text(
                      "بيانات الاشتراك الحالية",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Divider(color: Colors.white12, height: 24),
                _buildInfoRow("اسم المستخدم", _username),
                _buildInfoRow("الاشتراك", _planName),
                _buildInfoRow("السرعة المقدرة", "50 ميغابت/ثانية"),
                _buildInfoRow("حالة الحساب", "نشط - اشتراك ساري", isHighlight: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // تبويب: Glassy Dashboard V2 الفاخر (مطابق لصور التصميم المرفقة)
  // --------------------------------------------------------------------------
  Widget _buildGlassyV2Tab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ترويسة الترحيب الفاخرة
          GlassCard(
            borderRadius: 24,
            padding: const EdgeInsets.all(18),
            borderColor: AppTheme.primaryCyan.withOpacity(0.4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Good morning, Code XR",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "Stay on top of your tasks, activities and balance",
                      style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.goldVip.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.goldVip.withOpacity(0.4)),
                  ),
                  child: const Text(
                    "Glassy V2",
                    style: TextStyle(color: AppTheme.goldVip, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // كرت الرصيد الكلي Total Balance
          GlassCard(
            borderRadius: 26,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Total Balance", style: TextStyle(color: Colors.white60, fontSize: 13)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text("USD · +12.8%", style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  "\$580,951.32",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 34,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.send_rounded, size: 16),
                        label: const Text("Transfer"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.download_rounded, size: 16),
                        label: const Text("Request"),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Colors.white24),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // شبكة الإحصائيات الأربعة (2x2 Grid)
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  borderRadius: 20,
                  padding: const EdgeInsets.all(16),
                  borderColor: AppTheme.success.withOpacity(0.3),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Total Savings", style: TextStyle(color: Colors.white60, fontSize: 12)),
                      const SizedBox(height: 6),
                      const Text("\$914", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text("+14% this month", style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GlassCard(
                  borderRadius: 20,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Total Spending", style: TextStyle(color: Colors.white60, fontSize: 12)),
                      const SizedBox(height: 6),
                      const Text("\$655", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text("-4% this month", style: TextStyle(color: AppTheme.danger, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: GlassCard(
                  borderRadius: 20,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Total Income", style: TextStyle(color: Colors.white60, fontSize: 12)),
                      const SizedBox(height: 6),
                      const Text("\$940", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text("+8% this month", style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GlassCard(
                  borderRadius: 20,
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Total Revenue", style: TextStyle(color: Colors.white60, fontSize: 12)),
                      const SizedBox(height: 6),
                      const Text("\$713", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text("+12% this month", style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // كود JSX كما في لقطة الشاشة
          GlassCard(
            borderRadius: 22,
            padding: const EdgeInsets.all(16),
            borderColor: AppTheme.primaryPurple.withOpacity(0.3),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.code_rounded, color: AppTheme.primaryCyan, size: 20),
                        SizedBox(width: 8),
                        Text(
                          "StatsCard.jsx (Framer Motion)",
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text("jsx", style: TextStyle(color: AppTheme.primaryCyan, fontSize: 10, fontFamily: 'monospace')),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black45,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Text(
                    "import { motion } from 'framer-motion';\n"
                    "import { ShoppingBag, Users, ArrowUpRight } from 'lucide-react';\n\n"
                    "const StatsCard = ({ title, value, change }) => (\n"
                    "  <motion.div whileHover={{ y: -5 }} className=\"glass-card p-6 rounded-2xl\">\n"
                    "    <p className=\"text-sm text-white/60\">{title}</p>\n"
                    "    <h2 className=\"text-2xl font-bold text-white\">{value}</h2>\n"
                    "    <p className=\"text-emerald-400\">+{change}%</p>\n"
                    "  </motion.div>\n"
                    ");",
                    style: TextStyle(
                      color: Colors.white70,
                      fontFamily: 'monospace',
                      fontSize: 11,
                      height: 1.4,
                    ),
                    textDirection: TextDirection.ltr,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // تبويب 2: الذكاء الاصطناعي والفحص الذكي
  // --------------------------------------------------------------------------
  Widget _buildAiFeaturesTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // كرت محرك الذكاء الاصطناعي
          GlassCard(
            borderRadius: 24,
            padding: const EdgeInsets.all(20),
            borderColor: AppTheme.primaryPurple.withOpacity(0.5),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.primaryPurple.withOpacity(0.3),
                        AppTheme.primaryCyan.withOpacity(0.3),
                      ],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.auto_awesome_rounded,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  "محلل إيرثلنك الذكي (Earthlink AI Engine)",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  "نظام ذكاء اصطناعي يقوم بتحليل استهلاكك، التنبؤ بنفاد الرصيد، وتقديم توصيات مخصصة لشبكتك.",
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 18),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppTheme.surface,
                        content: const Text("⚡ جاري فحص وتحسين مسار الـ DNS وتصفية الإشارة..."),
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    );
                  },
                  icon: const Icon(Icons.flash_on_rounded, color: Colors.white),
                  label: const Text("تحسين الاتصال الذكي الآن"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryPurple,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // توقعات الذكاء الاصطناعي
          _buildAiPredictionCard(
            title: "توقع استهلاك البيانات",
            description: "بناءً على نشاطك خلال آخر 7 أيام، سيكفيك الرصيد الحالي حتى نهاية الشهر بأمان بمعدل 12.1 GB يومياً.",
            status: "استهلاك ممتاز",
            statusColor: AppTheme.success,
            icon: Icons.trending_up_rounded,
          ),
          const SizedBox(height: 12),
          _buildAiPredictionCard(
            title: "توصية التردد اللاسلكي",
            description: "تم رصد 4 أجهزة تستهلك النطاق. نوصي بتوصيل التلفاز وجهاز الألعاب بتردد 5GHz لتقليل زمن التأخير (Ping).",
            status: "توصية هامة",
            statusColor: AppTheme.accentNeon,
            icon: Icons.wifi_tethering_rounded,
          ),
          const SizedBox(height: 12),
          _buildAiPredictionCard(
            title: "ساعات الذروة المكتشفة",
            description: "أفضل أوقات التنزيل للألعاب والتحديثات الضخمة لشبكتك تبدأ من 2:00 صباحاً وحتى 8:00 صباحاً بأعلى سرعة.",
            status: "نصيحة توفير",
            statusColor: AppTheme.goldVip,
            icon: Icons.access_time_rounded,
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // تبويب 3: فحص السرعة التفاعلي
  // --------------------------------------------------------------------------
  Widget _buildSpeedTestTab() {
    return const SpeedTestSection();
  }

  // --------------------------------------------------------------------------
  // تبويب 4: تنبيهات تلجرام والإشعارات
  // --------------------------------------------------------------------------
  Widget _buildAlertsTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          GlassCard(
            borderRadius: 24,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.send_rounded, color: AppTheme.primaryCyan),
                    SizedBox(width: 8),
                    Text(
                      "ربط بوت التلجرام الفوري",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  "احصل على تنبيهات فورية عبر تلجرام عند استهلاك 80% من الرصيد أو قبل انتهاء الاشتراك بيومين.",
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 16),
                _buildInputField(
                  label: "معرّف المحادثة (Chat ID)",
                  hint: "مثال: 123456789",
                  icon: Icons.chat_bubble_outline_rounded,
                ),
                const SizedBox(height: 12),
                _buildInputField(
                  label: "رمز البوت (Telegram Bot Token)",
                  hint: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
                  icon: Icons.vpn_key_rounded,
                  isPassword: true,
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          backgroundColor: AppTheme.primaryCyan,
                          content: const Text("✅ تم إرسال رسالة تجريبية إلى بوت التلجرام بنجاح!"),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                    icon: const Icon(Icons.send_rounded),
                    label: const Text("إرسال تنبيه تجريبي الآن"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryCyan,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --------------------------------------------------------------------------
  // القائمة الجانبية الفاخرة (Drawer) مطابقة للصور
  // --------------------------------------------------------------------------
  Widget _buildLuxuryDrawer() {
    return Drawer(
      backgroundColor: AppTheme.surface,
      child: SafeArea(
        child: Column(
          children: [
            // ترويسة الحساب الفاخرة
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.primaryPurple.withOpacity(0.3),
                    AppTheme.primaryCyan.withOpacity(0.1),
                  ],
                ),
                border: const Border(bottom: BorderSide(color: Colors.white12)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [AppTheme.primaryPurple, AppTheme.primaryCyan],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryPurple.withOpacity(0.4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.person_rounded, color: Colors.white, size: 30),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              _username,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.verified_rounded, color: AppTheme.primaryCyan, size: 16),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          "مشترك VIP مفعّل",
                          style: TextStyle(color: AppTheme.goldVip, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // قائمة الروابط
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 12),
                children: [
                  _buildDrawerItem(
                    icon: Icons.dashboard_rounded,
                    title: "لوحة التحكم الرئيسية",
                    index: 0,
                  ),
                  _buildDrawerItem(
                    icon: Icons.dashboard_customize_rounded,
                    title: "واجهة Glassy Dashboard V2",
                    index: 1,
                  ),
                  _buildDrawerItem(
                    icon: Icons.psychology_rounded,
                    title: "الذكاء الاصطناعي والتحسين",
                    index: 2,
                  ),
                  _buildDrawerItem(
                    icon: Icons.speed_rounded,
                    title: "فحص السرعة والشبكة",
                    index: 3,
                  ),
                  _buildDrawerItem(
                    icon: Icons.notifications_rounded,
                    title: "التنبيهات وتلجرام",
                    index: 4,
                  ),
                  const Divider(color: Colors.white10, height: 28),
                  _buildDrawerItem(
                    icon: Icons.refresh_rounded,
                    title: "تحديث البيانات الآن",
                    onTap: () {
                      Navigator.pop(context);
                      setState(() {
                        _remainingGb = (_remainingGb - 0.5).clamp(0.0, _totalGb);
                      });
                    },
                  ),
                  _buildDrawerItem(
                    icon: Icons.settings_rounded,
                    title: "الإعدادات والثيمات",
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),

            // تذييل القائمة الجانبية
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                "Earthlink VIP Native Dart v3.0\nمبني ومجهز لأندرويد 15",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                  fontSize: 11,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    int? index,
    VoidCallback? onTap,
  }) {
    bool isSelected = index != null && _currentIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        tileColor: isSelected ? AppTheme.primaryPurple.withOpacity(0.2) : Colors.transparent,
        leading: Icon(
          icon,
          color: isSelected ? AppTheme.primaryCyan : Colors.white70,
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white70,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        onTap: () {
          if (index != null) {
            setState(() => _currentIndex = index);
            Navigator.pop(context);
          } else if (onTap != null) {
            onTap();
          }
        },
      ),
    );
  }

  // شريط الملاحة السفلي الفاخر
  Widget _buildLuxuryBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.85),
        border: const Border(top: BorderSide(color: Colors.white12)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.home_rounded, "الرئيسية"),
              _buildNavItem(1, Icons.dashboard_customize_rounded, "غلاسي V2"),
              _buildNavItem(2, Icons.psychology_rounded, "الذكاء"),
              _buildNavItem(3, Icons.speed_rounded, "السرعة"),
              _buildNavItem(4, Icons.notifications_rounded, "التنبيهات"),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryPurple.withOpacity(0.25) : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? AppTheme.primaryCyan : Colors.white54,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.white54,
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // أدوات مساعدة للواجهة
  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: GlassCard(
        borderRadius: 20,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              color: isHighlight ? AppTheme.success : Colors.white,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiPredictionCard({
    required String title,
    required String description,
    required String status,
    required Color statusColor,
    required IconData icon,
  }) {
    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: statusColor, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      status,
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  description,
                  style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required String hint,
    required IconData icon,
    bool isPassword = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white12),
          ),
          child: TextField(
            obscureText: isPassword,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, color: Colors.white54, size: 20),
              hintText: hint,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            ),
          ),
        ),
      ],
    );
  }
}

// ----------------------------------------------------------------------------
// ويدجت العداد المائي التفاعلي (Water Wave Animated Widget)
// ----------------------------------------------------------------------------
class WaterWaveWidget extends StatefulWidget {
  final double percentage;
  final String centerText;

  const WaterWaveWidget({
    super.key,
    required this.percentage,
    required this.centerText,
  });

  @override
  State<WaterWaveWidget> createState() => _WaterWaveWidgetState();
}

class _WaterWaveWidgetState extends State<WaterWaveWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _waveController,
      builder: (context, child) {
        return ClipOval(
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF0D061A),
              border: Border.all(color: AppTheme.primaryPurple.withOpacity(0.5), width: 3),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryCyan.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                CustomPaint(
                  painter: _WavePainter(
                    animationValue: _waveController.value,
                    percentage: widget.percentage,
                  ),
                  size: Size.infinite,
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      widget.centerText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        shadows: [
                          Shadow(color: Colors.black, blurRadius: 10),
                        ],
                      ),
                    ),
                    const Text(
                      "المتبقي",
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _WavePainter extends CustomPainter {
  final double animationValue;
  final double percentage;

  _WavePainter({required this.animationValue, required this.percentage});

  @override
  void paint(Canvas canvas, Size size) {
    final paintBack = Paint()
      ..shader = LinearGradient(
        colors: [
          AppTheme.primaryPurple.withOpacity(0.4),
          AppTheme.primaryCyan.withOpacity(0.4),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final paintFront = Paint()
      ..shader = const LinearGradient(
        colors: [
          AppTheme.primaryCyan,
          AppTheme.primaryPurple,
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    double baseHeight = size.height * (1.0 - percentage);

    // موجة خلفية
    Path pathBack = Path();
    pathBack.moveTo(0, size.height);
    for (double i = 0; i <= size.width; i++) {
      double y = baseHeight +
          math.sin((i / size.width * 2 * math.pi) + (animationValue * 2 * math.pi) + math.pi) * 8;
      pathBack.lineTo(i, y);
    }
    pathBack.lineTo(size.width, size.height);
    pathBack.close();
    canvas.drawPath(pathBack, paintBack);

    // موجة أمامية
    Path pathFront = Path();
    pathFront.moveTo(0, size.height);
    for (double i = 0; i <= size.width; i++) {
      double y = baseHeight +
          math.sin((i / size.width * 2 * math.pi) + (animationValue * 2 * math.pi)) * 10;
      pathFront.lineTo(i, y);
    }
    pathFront.lineTo(size.width, size.height);
    pathFront.close();
    canvas.drawPath(pathFront, paintFront);
  }

  @override
  bool shouldRepaint(covariant _WavePainter oldDelegate) => true;
}

// ----------------------------------------------------------------------------
// قسم فحص السرعة التفاعلي (Interactive Speed Test)
// ----------------------------------------------------------------------------
class SpeedTestSection extends StatefulWidget {
  const SpeedTestSection({super.key});

  @override
  State<SpeedTestSection> createState() => _SpeedTestSectionState();
}

class _SpeedTestSectionState extends State<SpeedTestSection> {
  bool _isTesting = false;
  double _downloadSpeed = 0.0;
  double _uploadSpeed = 0.0;
  int _ping = 18;
  Timer? _timer;

  void _startTest() {
    setState(() {
      _isTesting = true;
      _downloadSpeed = 0.0;
      _uploadSpeed = 0.0;
    });

    int step = 0;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      step++;
      setState(() {
        if (step <= 30) {
          _downloadSpeed = (math.sin(step / 5) * 15 + step * 1.5).clamp(0.0, 52.4);
        } else if (step <= 50) {
          _uploadSpeed = (math.sin(step / 4) * 8 + (step - 30) * 1.2).clamp(0.0, 24.8);
        } else {
          _isTesting = false;
          _downloadSpeed = 48.7;
          _uploadSpeed = 22.3;
          _timer?.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          GlassCard(
            borderRadius: 24,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Text(
                  "مقياس سرعة إيرثلنك المباشر",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 24),

                // دائرة السرعة الكبرى
                Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.black26,
                    border: Border.all(
                      color: _isTesting ? AppTheme.primaryCyan : AppTheme.primaryPurple,
                      width: 4,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (_isTesting ? AppTheme.primaryCyan : AppTheme.primaryPurple)
                            .withOpacity(0.3),
                        blurRadius: 24,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _downloadSpeed > 0 ? _downloadSpeed.toStringAsFixed(1) : "0.0",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const Text(
                        "Mbps - سرعة التحميل",
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // إحصائيات سريعة
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem("Ping", "$_ping ms", AppTheme.accentNeon),
                    _buildStatItem("Upload", "${_uploadSpeed.toStringAsFixed(1)} Mbps", AppTheme.primaryPurple),
                    _buildStatItem("Jitter", "2 ms", AppTheme.success),
                  ],
                ),
                const SizedBox(height: 24),

                ElevatedButton.icon(
                  onPressed: _isTesting ? null : _startTest,
                  icon: Icon(_isTesting ? Icons.hourglass_top_rounded : Icons.play_arrow_rounded),
                  label: Text(_isTesting ? "جاري قياس السرعة..." : "بدء اختبار السرعة الآن"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryCyan,
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: color,
            fontWeight: FontWeight.bold,
            fontSize: 15,
          ),
        ),
      ],
    );
  }
}

// ----------------------------------------------------------------------------
// كرت زجاجي مخصص (GlassCard)
// ----------------------------------------------------------------------------
class GlassCard extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final Color? borderColor;

  const GlassCard({
    super.key,
    required this.child,
    this.borderRadius = 20,
    this.padding = const EdgeInsets.all(16),
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: const Color(0xFF130924).withOpacity(0.65),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: borderColor ?? Colors.white.withOpacity(0.12),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }
}
