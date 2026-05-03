import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/config/assets.dart';
import 'package:sign_link/core/helper/constants.dart';
import 'package:sign_link/features/home/presentation/view/widgets/my_chat_bubble.dart';
import 'package:sign_link/features/home/presentation/view/widgets/chat_bubble_response.dart';

class CustomerAssistantViewBody extends StatelessWidget {
  const CustomerAssistantViewBody({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(kViewPadding),
      child: Column(
        children: [
          const Text(
            "Today",
            style: AppTextStyles.styleMedium14,
          ),
          const SizedBox(height: 24),
          const Align(
            alignment: Alignment.centerLeft,
            child: MyChatBubble(),
          ),
          const SizedBox(height: 12),
          const Align(
            alignment: Alignment.centerRight,
            child: ChatBubbleResponse(),
          ),
          const Spacer(),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: TextFormField(
              decoration: InputDecoration(
                suffixIcon: IconButton(
                  onPressed: () {},
                  icon: SvgPicture.asset(
                    Assets.imagesGallery,
                    fit: BoxFit.none,
                  ),
                ),
                hintText: "Message....",
                hintStyle: AppTextStyles.styleRegular12.copyWith(
                  color: AppColors.darkGrey,
                ),
                filled: true,
                fillColor: AppColors.grey20,
                enabledBorder: textFormFieldBorder(),
                focusedBorder: textFormFieldBorder(),
              ),
            ),
          )
        ],
      ),
    );
  }

  OutlineInputBorder textFormFieldBorder() {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(8),
      borderSide: const BorderSide(color: Colors.transparent),
    );
  }
}
