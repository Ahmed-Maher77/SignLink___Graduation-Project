import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class AppTheme {
  static ThemeData theme = ThemeData(
      brightness: Brightness.light,
      textTheme: GoogleFonts.poppinsTextTheme(),
      appBarTheme: AppBarTheme(
        titleTextStyle: AppTextStyles.styleRegular16.copyWith(
          color: Colors.black,
        ),
        centerTitle: true,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: AppColors.appSecondaryColor,
          ),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(
            color: Color(0xffEFEFEF),
          ),
        ),
      ));
}
