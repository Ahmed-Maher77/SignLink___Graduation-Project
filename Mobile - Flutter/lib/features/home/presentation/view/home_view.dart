import 'package:flutter/material.dart';

import 'package:sign_link/core/config/app_colors.dart';

import 'package:sign_link/core/helper/constants.dart';

import 'package:sign_link/features/home/presentation/view/widgets/desktop_layout.dart';

import 'package:sign_link/features/home/presentation/view/widgets/home_appbar.dart';
import 'package:sign_link/features/home/presentation/view/widgets/home_drawer.dart';

import 'package:sign_link/features/home/presentation/view/widgets/mobile_layout.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return Scaffold(
      backgroundColor: AppColors.grey20,
      drawer: width < kDesktopWidth ? const HomeDrawer() : null,
      appBar: width < kDesktopWidth ? const HomeAppBar() : null,
      body:
          width < kDesktopWidth ? const MobileLayout() : const DesktopLayout(),
    );
  }
}
