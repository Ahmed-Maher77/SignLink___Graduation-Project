import 'package:flutter/material.dart';

import 'package:sign_link/core/config/app_theme.dart';
import 'package:sign_link/features/introduction_views/presentation/views/introduction_view.dart';

void main() {
  // runApp(
  //   DevicePreview(
  //     builder: (context) => const SignLinkApp(), // Wrap your app
  //   ),
  // );
  runApp(const SignLinkApp());
}

class SignLinkApp extends StatelessWidget {
  const SignLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: AppTheme.theme,
      home: const IntroductionViews(),
    );
  }
}
