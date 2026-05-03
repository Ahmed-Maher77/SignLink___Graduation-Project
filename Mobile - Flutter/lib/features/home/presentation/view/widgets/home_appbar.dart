import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/widgets/custom_appbar_icon_button.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  const HomeAppBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      scrolledUnderElevation: 0,
      backgroundColor: Colors.transparent,
      elevation: 0,
      title: SvgPicture.asset(Assets.imagesAppbarLogo),
      leading: Builder(
        builder: (context) => CustomAppbarIconButton(
          icon: Icons.menu,
          onPressed: () {
            Scaffold.of(context).openDrawer();
          },
        ),
      ),
      actions: [
        CircleAvatar(
          radius: 18,
          backgroundColor: AppColors.green100,
          child: CircleAvatar(
            radius: 16.5,
            child: SvgPicture.asset(Assets.imagesProfileIcon),
          ),
        ),
        const SizedBox(
          width: 10,
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 15);
}
