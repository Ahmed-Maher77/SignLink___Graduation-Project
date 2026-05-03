import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';

class CustomAppbarIconButton extends StatelessWidget {
  const CustomAppbarIconButton({super.key, this.onPressed, this.icon});
  final void Function()? onPressed;
  final IconData? icon;
  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: onPressed,
      icon: CircleAvatar(
        radius: 15,
        backgroundColor: AppColors.appSecondaryColor,
        child: Center(
          child: Icon(
            icon,
            size: 15,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
