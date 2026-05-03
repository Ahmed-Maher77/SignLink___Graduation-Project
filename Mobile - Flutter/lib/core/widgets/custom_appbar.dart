import 'package:flutter/material.dart';
import 'package:sign_link/core/utils/app_navigation.dart';
import 'package:sign_link/core/widgets/custom_appbar_icon_button.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CustomAppBar({
    required this.text,
    super.key,
  });
  final String text;
  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: CustomAppbarIconButton(
        icon: Icons.arrow_back_ios_outlined,
        onPressed: () => AppNavigation.pop(context),
      ),
      title: Text(text),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
