import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/features/authentication/presentation/views/widgets/text_medium12.dart';

class CustomTextFormField extends StatelessWidget {
  const CustomTextFormField({
    required this.hint,
    required this.icon,
    required this.title,
    super.key,
    this.onSaved,
    this.validator,
    this.isPhoneNumberInput = false,
  });
  final String hint, icon, title;
  final void Function(String?)? onSaved;
  final String? Function(String?)? validator;
  final bool isPhoneNumberInput;
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextMedium12(
          text: title,
        ),
        const SizedBox(
          height: 14,
        ),
        TextFormField(
          keyboardType: isPhoneNumberInput ? TextInputType.phone : null,
          onSaved: onSaved,
          validator: validator,
          style: AppTextStyles.styleRegular12.copyWith(
            color: const Color(
              0xff6B6B6B,
            ),
          ),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: SvgPicture.asset(
              icon,
            ),
          ),
        ),
      ],
    );
  }
}
