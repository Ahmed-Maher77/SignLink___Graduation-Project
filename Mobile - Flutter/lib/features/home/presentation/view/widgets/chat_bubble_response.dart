import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/helper/constants.dart';

class ChatBubbleResponse extends StatelessWidget {
  const ChatBubbleResponse({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Container(
      constraints: BoxConstraints(
        maxWidth: size.width * 0.7,
      ),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: const BoxDecoration(
        color: AppColors.grey50,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(kCornerChatBubble),
          bottomLeft: Radius.circular(kCornerChatBubble),
          bottomRight: Radius.circular(kCornerChatBubble),
        ),
      ),
      child: Text(
        "hello",
        style: AppTextStyles.styleRegular12.copyWith(
          color: Colors.black,
        ),
      ),
    );
  }
}
