import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';

class SearchTextField extends StatelessWidget {
  const SearchTextField({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        filled: true,
        hintText: "Search",
        hintStyle:
            AppTextStyles.styleRegular12.copyWith(color: AppColors.grey80),
        fillColor: AppColors.grey20,
        prefixIcon: Padding(
          padding: const EdgeInsets.all(10),
          child: SvgPicture.asset(Assets.imagesSearchIcon),
        ),
        focusedBorder: setupBorderShape(),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30),
          borderSide: const BorderSide(color: Colors.transparent),
        ),
      ),
    );
  }

  OutlineInputBorder setupBorderShape() {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(30),
      borderSide: const BorderSide(color: Colors.transparent),
    );
  }
}
