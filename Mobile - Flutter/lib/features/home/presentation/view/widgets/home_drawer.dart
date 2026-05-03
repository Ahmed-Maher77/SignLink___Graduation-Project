import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/helper/constants.dart';
import 'package:sign_link/features/home/presentation/view/widgets/helper_options.dart';
import 'package:sign_link/features/home/presentation/view/widgets/profile_card.dart';

class HomeDrawer extends StatelessWidget {
  const HomeDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return Column(
      children: [
        SizedBox(height: width < kDesktopWidth ? kToolbarHeight + 60 : 0),
        Expanded(
          child: Drawer(
            elevation: 0,
            backgroundColor: AppColors.grey50,
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                children: [
                  const ProfileCard(),
                  const SizedBox(height: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const HelperOptions(),
                  ),
                  const Spacer(),
                  ListTile(
                    leading: SvgPicture.asset(Assets.imagesLogOutIcon),
                    title: Text(
                      "Log Out",
                      style: AppTextStyles.styleRegular12.copyWith(
                        color: const Color(0xffFF0000),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
