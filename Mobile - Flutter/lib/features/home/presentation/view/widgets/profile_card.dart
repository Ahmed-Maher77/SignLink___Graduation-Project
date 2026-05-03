import 'package:flutter/material.dart';

import 'package:sign_link/core/config/app_text_styles.dart';

class ProfileCard extends StatelessWidget {
  const ProfileCard({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return const Card(
      color: Colors.white,
      margin: EdgeInsets.zero,
      elevation: 0,
      child: ListTile(
        minTileHeight: 67,
        leading: CircleAvatar(
          radius: 22.5,
        ),
        title: Text(
          "Mohamed Ibrahim",
          style: AppTextStyles.styleSemiBold16,
        ),
      ),
    );
  }
}
