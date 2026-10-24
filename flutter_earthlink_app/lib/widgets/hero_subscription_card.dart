import 'package:flutter/material.dart';
import '../models/subscriber_model.dart';
import 'liquid_wave_meter.dart';

class HeroSubscriptionCard extends StatelessWidget {
  final SubscriberModel data;
  final VoidCallback onNavigateToData;
  final VoidCallback onNavigateToAlerts;

  const HeroSubscriptionCard({
    super.key,
    required this.data,
    required this.onNavigateToData,
    required this.onNavigateToAlerts,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Curved Glassmorphic Subscription Hero Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x662E1065), // Purple 950
                Color(0x990F172A), // Slate 900
                Color(0xCC030108), // Dark floor
              ],
            ),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(color: Colors.white.withOpacity(0.12)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF9333EA).withOpacity(0.18),
                blurRadius: 32,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              // Header: Account Logo, Plan Name, Status & Live Speed
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      // User Package Image
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: 50,
                          height: 50,
                          padding: const EdgeInsets.all(4),
                          color: Colors.white10,
                          child: Image.network(
                            data.accountImagePath,
                            fit: BoxFit.contain,
                            errorBuilder: (_, __, ___) => const Icon(
                              Icons.wifi_tethering,
                              color: Color(0xFF38BDF8),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'اشتراك إيرثلنك الفعلي',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white60,
                            ),
                          ),
                          Row(
                            children: [
                              Text(
                                'اشتراك ${data.accountName}',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.18),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.35)),
                                ),
                                child: Text(
                                  data.accountStatus,
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF34D399),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),

                  // Live Speed Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.speed, size: 16, color: Color(0xFF38BDF8)),
                        SizedBox(width: 6),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '185',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF38BDF8),
                                height: 1.0,
                              ),
                            ),
                            Text(
                              'Mbps',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Colors.white54,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // 3D Liquid Wave Meter (Sphere showing remaining days)
              LiquidWaveMeter(
                daysLeft: data.activeDaysLeft,
                totalDays: 30,
                expirationDate: data.accountExpirationDate,
              ),

              const SizedBox(height: 20),

              // 3 Mini Metrics Cards (Speed, Usage, Frequency)
              Row(
                children: [
                  _buildMetricTile(
                    icon: Icons.download_rounded,
                    color: const Color(0xFF38BDF8),
                    title: '185 Mbps',
                    subtitle: 'سرعة التحميل',
                  ),
                  const SizedBox(width: 8),
                  _buildMetricTile(
                    icon: Icons.storage_rounded,
                    color: const Color(0xFFA855F7),
                    title: '1.28 TB',
                    subtitle: 'استهلاك البيانات',
                  ),
                  const SizedBox(width: 8),
                  _buildMetricTile(
                    icon: Icons.wifi_rounded,
                    color: const Color(0xFFF472B6),
                    title: '5.0 GHz',
                    subtitle: 'تردد البث (16ms)',
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 2. Wallet & Recharge Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'رصيد الاشتراك / التكلفة',
                    style: TextStyle(fontSize: 11, color: Colors.white60),
                  ),
                  Text(
                    data.accountPrice,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),

              ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('تم فتح نافذة تجديد الاشتراك')),
                  );
                },
                icon: const Icon(Icons.add_circle_outline, size: 16),
                label: const Text('إعادة التعبئة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9333EA),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 3. Quick Actions Grid
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildQuickAction(
              icon: Icons.sync_rounded,
              color: Colors.amber,
              title: 'تجديد الاشتراك',
              onTap: () {},
            ),
            _buildQuickAction(
              icon: Icons.share_rounded,
              color: const Color(0xFF38BDF8),
              title: 'دعوة صديق',
              onTap: () {},
            ),
            _buildQuickAction(
              icon: Icons.bar_chart_rounded,
              color: const Color(0xFFF472B6),
              title: 'بيانات الانترنت',
              onTap: onNavigateToData,
            ),
            _buildQuickAction(
              icon: Icons.auto_awesome_rounded,
              color: const Color(0xFF34D399),
              title: 'تغيير الاشتراك',
              onTap: () {},
            ),
          ],
        ),

        const SizedBox(height: 16),

        // 4. Shabakaty & Cinemana Banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFF9333EA).withOpacity(0.25),
                const Color(0xFF312E81).withOpacity(0.15),
                Colors.black45,
              ],
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF9333EA).withOpacity(0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFEC4899), Color(0xFF9333EA)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.tv_rounded, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'منصة شبكتي والترفيه',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'سينمانا، شاشتي، إيرثلنك TV',
                        style: TextStyle(fontSize: 10, color: Colors.white60),
                      ),
                    ],
                  ),
                ],
              ),
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                child: const Text('شوفه هنا', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  static Widget _buildMetricTile({
    required IconData icon,
    required Color color,
    required String title,
    required String subtitle,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 9, color: Colors.white60),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildQuickAction({
    required IconData icon,
    required Color color,
    required String title,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 3),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
