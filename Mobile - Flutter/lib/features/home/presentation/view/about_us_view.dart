import 'package:flutter/material.dart';
import 'package:sign_link/core/widgets/custom_appbar.dart';
import 'package:sign_link/features/home/presentation/view/widgets/about_us_view_body.dart';

class AboutUsView extends StatelessWidget {
  const AboutUsView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(text: "About Us"),
      body: AboutUsViewBody(),
    );
  }
}
