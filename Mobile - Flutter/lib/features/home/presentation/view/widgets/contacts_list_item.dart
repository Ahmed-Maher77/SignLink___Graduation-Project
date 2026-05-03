import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_colors.dart';
import 'package:sign_link/core/config/app_text_styles.dart';

class ContactsListItem extends StatelessWidget {
  const ContactsListItem({
    this.isLastIndex = false,
    super.key,
  });
  final bool isLastIndex;
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ListTile(
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            radius: 21,
          ),
          title: Text(
            "Samir Monsef",
            style: AppTextStyles.styleSemiBold12,
          ),
        ),
        isLastIndex
            ? const SizedBox()
            : const Divider(
                height: 20,
                color: AppColors.grey20,
              ),
      ],
    );
  }
}
