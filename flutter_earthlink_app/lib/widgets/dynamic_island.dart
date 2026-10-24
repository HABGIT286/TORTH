import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DynamicIslandWidget extends StatefulWidget {
  final bool isOnline;

  const DynamicIslandWidget({
    super.key,
    this.isOnline = true,
  });

  @override
  State<DynamicIslandWidget> createState() => _DynamicIslandWidgetState();
}

class _DynamicIslandWidgetState extends State<DynamicIslandWidget> {
  late String _timeString;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
  }

  void _updateTime() {
    final now = DateTime.now();
    setState(() {
      _timeString = DateFormat('h:mm:ss a').format(now);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // 12-Hour Digital Clock
          Text(
            _timeString,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.white70,
              letterSpacing: 0.8,
            ),
          ),

          // Dynamic Island Pill
          Container(
            height: 28,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: const Color(0xFF030108),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white12),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black87,
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Simulated Camera Sensor
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24, width: 1.5),
                  ),
                ),
                const SizedBox(width: 8),

                // Pulsing Status Dot
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: widget.isOnline ? const Color(0xFF34D399) : Colors.redAccent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: widget.isOnline
                            ? const Color(0xFF34D399).withOpacity(0.8)
                            : Colors.redAccent,
                        blurRadius: 6,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Network Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: widget.isOnline
                  ? const Color(0xFF10B981).withOpacity(0.12)
                  : Colors.redAccent.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: widget.isOnline
                    ? const Color(0xFF10B981).withOpacity(0.3)
                    : Colors.redAccent.withOpacity(0.3),
              ),
            ),
            child: Text(
              widget.isOnline ? 'متصل' : 'غير متصل',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: widget.isOnline ? const Color(0xFF34D399) : Colors.redAccent,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
