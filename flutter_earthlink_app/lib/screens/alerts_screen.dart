import 'package:flutter/material.dart';

class AlertsScreen extends StatefulWidget {
  final bool hasActiveSchedule;
  final ValueChanged<bool> onToggleSchedule;

  const AlertsScreen({
    super.key,
    required this.hasActiveSchedule,
    required this.onToggleSchedule,
  });

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  int _selectedDay = 25;
  String _selectedHour = '12';
  String _selectedMinute = '30';
  String _selectedPeriod = 'م'; // م (PM) or ص (AM)
  String _channel = 'both';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 90),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          const Row(
            children: [
              Icon(Icons.notifications_active_rounded, color: Color(0xFFA855F7), size: 22),
              SizedBox(width: 8),
              Text(
                'التنبيهات المخصصة والفورية',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'تحديد مواعيد التنبيه بدقة وإرسال إشعارات الانتهاء',
            style: TextStyle(fontSize: 11, color: Colors.white60),
          ),

          const SizedBox(height: 16),

          // 1. Manual Schedule Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF9333EA).withOpacity(0.18),
                  const Color(0xFF0F172A).withOpacity(0.5),
                ],
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: const Color(0xFF9333EA).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'تحديد موعد تنبيه دقيق بالشهر',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: widget.hasActiveSchedule
                            ? const Color(0xFF10B981).withOpacity(0.2)
                            : Colors.white10,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: widget.hasActiveSchedule
                              ? const Color(0xFF10B981)
                              : Colors.white24,
                        ),
                      ),
                      child: Text(
                        widget.hasActiveSchedule ? 'مفعل الآن (شعار ظاهر)' : 'غير محدد',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: widget.hasActiveSchedule ? const Color(0xFF34D399) : Colors.white60,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                const Text(
                  '١. اختر يوم الشهر:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70),
                ),
                const SizedBox(height: 8),

                // Days Row Selector
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: List.generate(31, (i) {
                      final day = i + 1;
                      final isSelected = _selectedDay == day;
                      return InkWell(
                        onTap: () => setState(() => _selectedDay = day),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 36,
                          height: 36,
                          margin: const EdgeInsets.only(left: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF9333EA) : Colors.black45,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: isSelected ? Colors.white : Colors.white10),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            '$day',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : Colors.white70,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                const SizedBox(height: 16),

                const Text(
                  '٢. حدد الساعة والدقيقة والتوقيت:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70),
                ),
                const SizedBox(height: 8),

                // Time Pickers
                Row(
                  children: [
                    // Hour
                    Expanded(
                      child: _buildTimeDropdown('الساعة', _selectedHour, ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'], (val) {
                        setState(() => _selectedHour = val!);
                      }),
                    ),
                    const SizedBox(width: 8),
                    // Minute
                    Expanded(
                      child: _buildTimeDropdown('الدقيقة', _selectedMinute, ['00', '15', '30', '45'], (val) {
                        setState(() => _selectedMinute = val!);
                      }),
                    ),
                    const SizedBox(width: 8),
                    // Period AM/PM
                    Expanded(
                      child: _buildTimeDropdown('التوقيت', _selectedPeriod, ['ص', 'م'], (val) {
                        setState(() => _selectedPeriod = val!);
                      }),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Activate / Cancel Schedule Button
                ElevatedButton.icon(
                  onPressed: () {
                    widget.onToggleSchedule(!widget.hasActiveSchedule);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          !widget.hasActiveSchedule
                              ? 'تم تفعيل التنبيه ليوم $_selectedDay الساعة $_selectedHour:$_selectedMinute $_selectedPeriod'
                              : 'تم إلغاء التنبيه وإخفاء الشعار',
                        ),
                      ),
                    );
                  },
                  icon: Icon(widget.hasActiveSchedule ? Icons.cancel_outlined : Icons.check_circle_outline_rounded),
                  label: Text(
                    widget.hasActiveSchedule ? 'إلغاء التنبيه المحدد' : 'تأكيد وحفظ التنبيه المحدد',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: widget.hasActiveSchedule ? Colors.redAccent : const Color(0xFF9333EA),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // 2. Instant Broadcast Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'إرسال تنبيه فوري',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 8),
                const Text(
                  'بث إشعار فوري بحالة ورصيد اشتراكك لقنواتك',
                  style: TextStyle(fontSize: 11, color: Colors.white60),
                ),
                const SizedBox(height: 14),

                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تم إرسال التنبيه الفوري بنجاح ✓')),
                    );
                  },
                  icon: const Icon(Icons.send_rounded, size: 16),
                  label: const Text('إرسال الآن', style: TextStyle(fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF06B6D4),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeDropdown(String label, String value, List<String> items, ValueChanged<String?> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.black45,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          dropdownColor: const Color(0xFF0F172A),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF38BDF8)),
          items: items.map((item) {
            return DropdownMenuItem<String>(
              value: item,
              child: Text(item, textAlign: TextAlign.center),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
