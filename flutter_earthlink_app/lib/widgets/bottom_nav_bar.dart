import 'package:flutter/material.dart';

class LuxuryBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final bool hasActiveAlert;

  const LuxuryBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    this.hasActiveAlert = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      height: 64,
      decoration: BoxDecoration(
        color: const Color(0xFF030108).withOpacity(0.92),
        borderRadius: BorderRadius.circular(36),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black87,
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home_rounded, 'الرئيسية'),
          _buildNavItem(1, Icons.insert_chart_outlined_rounded, 'التقرير'),
          _buildNavItem(2, Icons.notifications_none_rounded, 'التنبيهات', isAlert: true),
          _buildNavItem(3, Icons.tune_rounded, 'الإعدادات'),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, {bool isAlert = false}) {
    final bool isSelected = currentIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => onTabSelected(index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF9333EA).withOpacity(0.25)
                        : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    icon,
                    size: 20,
                    color: isSelected ? const Color(0xFF38BDF8) : Colors.white60,
                  ),
                ),
                if (isAlert && hasActiveAlert)
                  Positioned(
                    top: 2,
                    right: 2,
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
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? Colors.white : Colors.white54,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
