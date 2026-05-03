import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/helper/constants.dart';

class ContactsViewBody extends StatelessWidget {
  const ContactsViewBody({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(kViewPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Stay Connected, Seamlessly",
            style: AppTextStyles.styleMedium16,
          ),
          const SizedBox(height: 4),
          const Text(
            "Have questions, feedback, or need assistance? Our team is here to support you. Let’s make communication more accessible for everyone!",
            style: AppTextStyles.styleRegular12,
          ),
          const SizedBox(height: 24),
          Card(
              color: AppColors.grey20,
              elevation: 0,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Customer Support",
                        style: AppTextStyles.styleRegular16
                            .copyWith(color: AppColors.darkGrey),
                      ),
                      const SizedBox(height: 12),
                      buildCustomerSupportListTileItem(
                        icon: Assets.imagesPhoneCutomerSupportIcon,
                        title: "Phone Number",
                        subtitle: "+201021286160",
                      ),
                      const Divider(
                        height: 24,
                        color: Colors.white,
                      ),
                      buildCustomerSupportListTileItem(
                        icon: Assets.imagesMailCutomerSupportIcon,
                        title: "Email Address",
                        subtitle: "mohamedibrahim@gmail.com",
                      ),
                    ]),
              ))
        ],
      ),
    );
  }

  ListTile buildCustomerSupportListTileItem(
      {required String icon, required String title, required String subtitle}) {
    return ListTile(
      contentPadding: const EdgeInsets.all(0),
      leading: SvgPicture.asset(
        icon,
      ),
      title: Text(
        title,
        style: AppTextStyles.styleRegular12.copyWith(
          color: AppColors.grey100,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: AppTextStyles.styleRegular14,
      ),
    );
  }
}
