import 'package:flutter/material.dart';

import 'package:sign_link/core/widgets/custom_appbar.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/sign_in_view_body.dart';

class SignInView extends StatelessWidget {
  const SignInView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(
        text: "Sign In",
      ),
      body: SignInViewBody(),
    );
  }
}
