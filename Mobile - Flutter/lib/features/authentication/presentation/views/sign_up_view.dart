import 'package:flutter/material.dart';
import 'package:sign_link/core/widgets/custom_appbar.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/sign_up_view_body.dart';

class SignUpView extends StatelessWidget {
  const SignUpView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(
        text: "Sign Up",
      ),
      body: SignUpViewBody(),
    );
  }
}
