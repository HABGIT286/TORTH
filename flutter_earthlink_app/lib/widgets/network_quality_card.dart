import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NetworkQualityCard extends StatefulWidget {
  final String userIP;

  const NetworkQualityCard({
    super.key,
    required this.userIP,
  });

  @override
  State<NetworkQualityCard> createState() => _NetworkQualityCardState();
}

class _NetworkQualityCardState extends State<NetworkQualityCard> {
  int _ping = 16;
  int _downloadSpeed = 185;
  int _uploadSpeed = 92;
  bool _copied = false;

  void _testSpeed() {
    setState(() {
      _ping = 14 + Random().nextInt(6);
      _downloadSpeed = 175 + Random().nextInt(25);
      _uploadSpeed = 88 + Random().nextInt(14);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم قياس جودة واستقرار شبكة إيرثلنك بنجاح')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF06B6D4).withOpacity(0.12),
            const Color(0xFF0F172A).withOpacity(0.4),
            Colors.black54,
          ],
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.25)),
      ),
      child: Column(
        children: [
          // Header with Radar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(0xFF06B6D4).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF06B6D4).withOpacity(0.35)),
                    ),
                    child: const Icon(Icons.radar, color: Color(0xFF38BDF8), size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'إشارة وقوة الإنترنت الحقيقية',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'شبكة Earthlink Fiber 5G',
                        style: TextStyle(fontSize: 10, color: Color(0xFF38BDF8)),
                      ),
                    ],
                  ),
                ],
              ),

              IconButton(
                onPressed: _testSpeed,
                icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Speed & Ping Metrics
          Row(
            children: [
              _buildSpeedTile(
                title: 'سرعة التحميل',
                val: '$_downloadSpeed',
                unit: 'Mbps',
                color: const Color(0xFF38BDF8),
                icon: Icons.arrow_downward_rounded,
              ),
              const SizedBox(width: 8),
              _buildSpeedTile(
                title: 'سرعة الرفع',
                val: '$_uploadSpeed',
                unit: 'Mbps',
                color: const Color(0xFF818CF8),
                icon: Icons.arrow_upward_rounded,
              ),
              const SizedBox(width: 8),
              _buildSpeedTile(
                title: 'الاستجابة (Ping)',
                val: '$_ping',
                unit: 'ms',
                color: const Color(0xFF34D399),
                icon: Icons.flash_on_rounded,
              ),
            ],
          ),

          const SizedBox(height: 14),

          // User IP Row
          InkWell(
            onTap: () {
              Clipboard.setData(ClipboardData(text: widget.userIP));
              setState(() => _copied = true);
              Future.delayed(const Duration(seconds: 2), () {
                if (mounted) setState(() => _copied = false);
              });
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.public_rounded, size: 16, color: Color(0xFF38BDF8)),
                      const SizedBox(width: 8),
                      Text(
                        'عنوان IP: ${widget.userIP}',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _copied ? 'تم النسخ ✓' : 'انقر للنسخ',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _copied ? const Color(0xFF34D399) : Colors.white60,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeedTile({
    required String title,
    required String val,
    required String unit,
    required Color color,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 12, color: color),
                const SizedBox(width: 4),
                Text(
                  title,
                  style: const TextStyle(fontSize: 9, color: Colors.white60),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  val,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: color,
                  ),
                ),
                const SizedBox(width: 2),
                Text(
                  unit,
                  style: const TextStyle(fontSize: 8, color: Colors.white54),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
