import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/features/authentication/presentation/manager/password_text_form_field_cubit/password_text_form_field_cubit.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/text_medium12.dart';

class BuildPasswordTextFormField extends StatelessWidget {
  const BuildPasswordTextFormField({
    super.key,
    this.onSaved,
    this.validator,
  });
  final void Function(String?)? onSaved;
  final String? Function(String?)? validator;
  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => PasswordTextFormFieldCubit(),
      child: BlocBuilder<PasswordTextFormFieldCubit, bool>(
        builder: (context, state) {
          bool isVisible =
              BlocProvider.of<PasswordTextFormFieldCubit>(context).isVisible;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const TextMedium12(
                text: "Password",
              ),
              const SizedBox(
                height: 14,
              ),
              TextFormField(
                obscureText: isVisible,
                onSaved: onSaved,
                validator: validator,
                style: AppTextStyles.styleRegular12.copyWith(
                  color: const Color(
                    0xff6B6B6B,
                  ),
                ),
                decoration: InputDecoration(
                  suffixIcon: IconButton(
                    onPressed: () {
                      BlocProvider.of<PasswordTextFormFieldCubit>(context)
                          .changeState();
                    },
                    icon: isVisible
                        ? SizedBox(
                            height: 32,
                            width: 32,
                            child: SvgPicture.asset(
                              Assets.imagesClosedEyeIcon,
                            ),
                          )
                        : const Icon(
                            Icons.visibility,
                            size: 32,
                          ),
                  ),
                  hintText: "Enter Password",
                  prefixIcon: SvgPicture.asset(
                    Assets.imagesPasswordIcon,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
