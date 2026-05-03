import 'package:flutter/material.dart';

import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/helper/constants.dart';

import 'package:sign_link/core/helper/validate_email.dart';
import 'package:sign_link/core/helper/validate_password.dart';
import 'package:sign_link/core/utils/app_navigation.dart';
import 'package:sign_link/features/authentication/presentation/views/sign_up_view.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/auth_using_facebook_or_google.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/custom_button.dart';

import 'package:sign_link/features/authentication/presentation/views/widgets/custom_text_form_field.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/dividers_with_or_text.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/password_text_form_field.dart';
import 'package:sign_link/features/home/presentation/view/home_view.dart';

class SignInViewBody extends StatefulWidget {
  const SignInViewBody({super.key});

  @override
  State<SignInViewBody> createState() => _SignInViewBodyState();
}

class _SignInViewBodyState extends State<SignInViewBody> {
  GlobalKey<FormState> formKey = GlobalKey();
  AutovalidateMode autovalidateMode = AutovalidateMode.disabled;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: kViewPadding),
      child: SingleChildScrollView(
        child: Form(
          key: formKey,
          autovalidateMode: autovalidateMode,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(
                height: 40,
              ),
              CustomTextFormField(
                validator: (email) {
                  return validateEmail(email);
                },
                hint: "Enter Your Email",
                icon: Assets.imagesEmailMailIcon,
                title: "Email Address",
              ),
              const SizedBox(
                height: 24,
              ),
              BuildPasswordTextFormField(
                validator: (password) {
                  return validatePassword(password);
                },
              ),
              const SizedBox(
                height: 24,
              ),
              CustomButton(
                text: "Sign In",
                onPressed: () {
                  if (formKey.currentState!.validate()) {
                    navigateToHomeView(context);
                  } else {
                    setState(() {
                      autovalidateMode = AutovalidateMode.always;
                    });
                  }
                },
              ),
              const SizedBox(
                height: 40,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Don’t have an account?",
                    style: AppTextStyles.styleMedium14,
                  ),
                  TextButton(
                    onPressed: () {
                      AppNavigation.pushWithFadingAnimation(
                        context: context,
                        view: const SignUpView(),
                      );
                    },
                    child: Text(
                      "Sign Up",
                      style: AppTextStyles.styleMedium14.copyWith(
                        color: AppColors.appPrimaryColor,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(
                height: 32,
              ),
              const DividersWithOrText(),
              const SizedBox(
                height: 12,
              ),
              const AuthUsingFacebookOrGoogle(),
            ],
          ),
        ),
      ),
    );
  }

  void navigateToHomeView(BuildContext context) {
    AppNavigation.pushAndRemoveAllWithFadingAnimation(
      context: context,
      view: const HomeView(),
    );
  }
}
