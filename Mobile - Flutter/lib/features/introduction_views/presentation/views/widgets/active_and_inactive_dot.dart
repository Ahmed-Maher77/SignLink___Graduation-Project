import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';

class ActiveAndInActiveDot extends StatelessWidget {
  const ActiveAndInActiveDot({super.key, this.isActive = false});
  final bool isActive;
  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      margin: const EdgeInsets.only(right: 8),
      duration: const Duration(microseconds: 600),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        color: isActive ? AppColors.appSecondaryColor : const Color(0xffEFEFEF),
      ),
      height: 7,
      width: isActive ? 22 : 7,
    );
  }
}
