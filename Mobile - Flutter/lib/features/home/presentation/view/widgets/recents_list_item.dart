import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class RecentsListItem extends StatelessWidget {
  const RecentsListItem({
    this.isLastIndex = false,
    super.key,
  });
  final bool isLastIndex;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          contentPadding: EdgeInsets.zero,
          minTileHeight: 0,
          leading: const CircleAvatar(
            radius: 21,
          ),
          title: const Text(
            "Samir Monsef",
            style: AppTextStyles.styleSemiBold12,
          ),
          subtitle: const Text(
            "Last call: today 05:24",
            style: AppTextStyles.styleRegular11,
          ),
          trailing: Text(
            "08:43",
            style: AppTextStyles.styleRegular12
                .copyWith(color: AppColors.darkGrey),
          ),
        ),
        isLastIndex
            ? const SizedBox()
            : const Divider(
                height: 20,
                color: AppColors.grey20,
              ),
      ],
    );
  }
}
