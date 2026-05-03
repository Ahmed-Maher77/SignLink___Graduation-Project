import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class CustomAnimatedContainer extends StatelessWidget {
  const CustomAnimatedContainer({
    required this.text,
    super.key,
    this.isActive = false,
    this.onTap,
  });
  final String text;
  final bool isActive;
  final void Function()? onTap;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isActive ? Colors.white : null,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: AppTextStyles.styleRegular14,
        ),
      ),
    );
  }
}
