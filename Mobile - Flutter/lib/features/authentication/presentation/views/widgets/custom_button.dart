import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class CustomButton extends StatelessWidget {
  const CustomButton({
    required this.text,
    super.key,
    this.onPressed,
  });
  final String text;
  final void Function()? onPressed;
  @override
  Widget build(BuildContext context) {
    return MaterialButton(
      onPressed: onPressed,
      color: AppColors.appPrimaryColor,
      height: 60,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: Text(
          text,
          style: AppTextStyles.styleMedium14.copyWith(
            color: const Color(0xffEEF2FF),
          ),
        ),
      ),
    );
  }
}
