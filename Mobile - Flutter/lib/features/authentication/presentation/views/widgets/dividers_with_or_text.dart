import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class DividersWithOrText extends StatelessWidget {
  const DividersWithOrText({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 74),
      child: Row(
        children: [
          const Expanded(
              child: Divider(
            color: AppColors.grey2,
          )),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              "Or",
              style: AppTextStyles.styleRegular12.copyWith(
                color: AppColors.grey2,
              ),
            ),
          ),
          const Expanded(
            child: Divider(
              color: AppColors.grey2,
            ),
          ),
        ],
      ),
    );
  }
}
