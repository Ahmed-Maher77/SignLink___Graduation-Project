import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class TextMedium12 extends StatelessWidget {
  const TextMedium12({
    required this.text,
    super.key,
  });
  final String text;
  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: AppTextStyles.styleMedium12,
    );
  }
}
