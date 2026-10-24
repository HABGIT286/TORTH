import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/subscriber_model.dart';

class ReportScreen extends StatefulWidget {
  final SubscriberModel data;
  final VoidCallback onRefresh;

  const ReportScreen({
    super.key,
    required this.data,
    required this.onRefresh,
  });

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  bool _isVisual = true;
  bool _copied = false;

  String _generateReportText() {
    return '''EARTHLINK SUBSCRIBER REPORT
الاسم الكامل: ${widget.data.fullName}
اسم المستخدم: ${widget.data.userID}
نوع الاشتراك: ${widget.data.accountName}
سعر الاشتراك: ${widget.data.accountPrice}
حالة الاشتراك: ${widget.data.accountStatus}
الأيام المتبقية: ${widget.data.activeDaysLeft} يوم
تاريخ النفاذ: ${widget.data.accountExpirationDate}
عنوان IP الحالي: ${widget.data.userIP}
رقم الهاتف: ${widget.data.mobileNumber}
اسم الوكيل: ${widget.data.agentName}
المدينة / العنوان: ${widget.data.city} - ${widget.data.address}
آخر تحديث: ${DateTime.now().toLocal().toString().split('.')[0]}
الحالة: متصل عبر شبكة إيرثلنك الفايبر الحقيقية''';
  }

  void _copyReport() {
    Clipboard.setData(ClipboardData(text: _generateReportText()));
    setState(() => _copied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم نسخ تقرير الاشتراك بالكامل للحافظة ✓')),
    );
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final details = [
      {'label': 'الاسم الكامل', 'val': widget.data.fullName, 'icon': Icons.person_rounded, 'color': const Color(0xFFA855F7)},
      {'label': 'اسم المستخدم', 'val': widget.data.userID, 'icon': Icons.tag_rounded, 'color': const Color(0xFF38BDF8)},
      {'label': 'نوع الاشتراك', 'val': widget.data.accountName, 'icon': Icons.stars_rounded, 'color': Colors.amber},
      {'label': 'سعر الاشتراك', 'val': widget.data.accountPrice, 'icon': Icons.credit_card_rounded, 'color': const Color(0xFF34D399)},
      {'label': 'الأيام المتبقية', 'val': '${widget.data.activeDaysLeft} يوم', 'icon': Icons.access_time_filled_rounded, 'color': Colors.pinkAccent},
      {'label': 'تاريخ النفاذ', 'val': widget.data.accountExpirationDate, 'icon': Icons.calendar_month_rounded, 'color': Colors.indigoAccent},
      {'label': 'عنوان IP الحالي', 'val': widget.data.userIP, 'icon': Icons.language_rounded, 'color': const Color(0xFF38BDF8)},
      {'label': 'رقم الهاتف', 'val': widget.data.mobileNumber, 'icon': Icons.phone_rounded, 'color': const Color(0xFF34D399)},
      {'label': 'اسم الوكيل', 'val': widget.data.agentName, 'icon': Icons.shield_rounded, 'color': const Color(0xFFA855F7)},
      {'label': 'حالة الاشتراك', 'val': widget.data.accountStatus, 'icon': Icons.wifi_rounded, 'color': const Color(0xFF34D399)},
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.only(bottom: 90),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'تقرير بيانات الاشتراك',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white),
                  ),
                  Text(
                    'بيانات مباشرة من سيرفر إيرثلنك الرسمي',
                    style: TextStyle(fontSize: 11, color: Colors.white60),
                  ),
                ],
              ),
              IconButton(
                onPressed: widget.onRefresh,
                icon: const Icon(Icons.refresh_rounded, color: Color(0xFF38BDF8)),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Switcher (Visual vs Raw Text)
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.black45,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isVisual = true),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: _isVisual ? const Color(0xFF9333EA) : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'بطاقات البيانات الفخمة',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _isVisual ? Colors.white : Colors.white60,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _isVisual = false),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: !_isVisual ? const Color(0xFF9333EA) : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'نص التقرير للنسخ المباشر',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: !_isVisual ? Colors.white : Colors.white60,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          if (_isVisual) ...[
            // Grid of 10 Cards
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 2.1,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: details.length,
              itemBuilder: (context, index) {
                final item = details[index];
                return Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withOpacity(0.4),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Icon(item['icon'] as IconData, size: 14, color: item['color'] as Color),
                          const SizedBox(width: 6),
                          Text(
                            item['label'] as String,
                            style: const TextStyle(fontSize: 10, color: Colors.white60),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item['val'] as String,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 14),

            // Quick Copy Action Box
            InkWell(
              onTap: _copyReport,
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF9333EA).withOpacity(0.3),
                      const Color(0xFF0F172A).withOpacity(0.5),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF9333EA).withOpacity(0.4)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.copy_rounded, color: Color(0xFF38BDF8), size: 18),
                        SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'نسخ التقرير بالكامل للحافظة',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              'بصيغة إيرثلنك الرسمية الجاهزة للإرسال',
                              style: TextStyle(fontSize: 10, color: Colors.white60),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Text(
                      _copied ? 'تم النسخ ✓' : 'نسخ الآن',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            // Raw Preformatted Text Container
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'EARTHLINK SUBSCRIBER REPORT',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                      ),
                      IconButton(
                        onPressed: _copyReport,
                        icon: const Icon(Icons.copy_rounded, size: 16, color: Colors.white70),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white12),
                  SelectableText(
                    _generateReportText(),
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: Colors.white70,
                      height: 1.6,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
