import 'dart:math' as math;
import 'package:flutter/material.dart';

class LiquidWaveMeter extends StatefulWidget {
  final int daysLeft;
  final int totalDays;
  final String expirationDate;

  const LiquidWaveMeter({
    super.key,
    required this.daysLeft,
    this.totalDays = 30,
    required this.expirationDate,
  });

  @override
  State<LiquidWaveMeter> createState() => _LiquidWaveMeterState();
}

class _LiquidWaveMeterState extends State<LiquidWaveMeter>
    with SingleTickerProviderStateMixin {
  late AnimationController _waveController;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..repeat();
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double percentage =
        (widget.daysLeft / widget.totalDays).clamp(0.05, 1.0);

    return Column(
      children: [
        SizedBox(
          width: 170,
          height: 170,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Outer Glowing Spherical Ring
              Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withOpacity(0.15),
                    width: 3,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF9333EA).withOpacity(0.35),
                      blurRadius: 28,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),

              // Clipped Liquid Wave
              ClipOval(
                child: AnimatedBuilder(
                  animation: _waveController,
                  builder: (context, child) {
                    return CustomPaint(
                      size: const Size(160, 160),
                      painter: WavePainter(
                        waveProgress: _waveController.value,
                        fillPercentage: percentage,
                      ),
                    );
                  },
                ),
              ),

              // Center Days Counter Overlay
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${widget.daysLeft}',
                    style: const TextStyle(
                      fontSize: 38,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.0,
                      shadows: [
                        Shadow(
                          color: Colors.black54,
                          blurRadius: 8,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'أيام متبقية',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white70,
                      shadows: [
                        Shadow(
                          color: Colors.black87,
                          blurRadius: 6,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Expiration Date Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.4),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white12),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: Color(0xFF38BDF8)),
              const SizedBox(width: 6),
              Text(
                'ينتهي الاشتراك في: ${widget.expirationDate}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class WavePainter extends CustomPainter {
  final double waveProgress;
  final double fillPercentage;

  WavePainter({
    required this.waveProgress,
    required this.fillPercentage,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double waterHeight = size.height * (1.0 - fillPercentage);

    // Background water gradient
    final Paint wavePaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF38BDF8), // Cyan 400
          Color(0xFF818CF8), // Indigo 400
          Color(0xFF9333EA), // Purple 600
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final Path path = Path();
    path.moveTo(0, size.height);
    path.lineTo(0, waterHeight);

    for (double x = 0; x <= size.width; x++) {
      final double wave1 = 7.0 *
          math.sin((x / size.width * 2 * math.pi) + (waveProgress * 2 * math.pi));
      final double y = waterHeight + wave1;
      path.lineTo(x, y);
    }

    path.lineTo(size.width, size.height);
    path.close();

    canvas.drawPath(path, wavePaint);
  }

  @override
  bool shouldRepaint(covariant WavePainter oldDelegate) {
    return oldDelegate.waveProgress != waveProgress ||
        oldDelegate.fillPercentage != fillPercentage;
  }
}
