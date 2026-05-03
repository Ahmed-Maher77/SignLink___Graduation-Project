import 'package:flutter/material.dart';
import 'package:sign_link/core/config/app_text_styles.dart';
import 'package:sign_link/core/helper/constants.dart';

class AboutUsViewBody extends StatelessWidget {
  const AboutUsViewBody({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(kViewPadding),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            buildTextMedium16(text: "Breaking Barriers in Communication"),
            const SizedBox(height: 4),
            buildTextRegular12(
                text:
                    "Empowering conversations with innovative technology for everyone."),
            const SizedBox(height: 16),
            buildTextMedium16(text: "Our Mission"),
            const SizedBox(height: 4),
            buildTextRegular12(
                text:
                    "We believe in a world where communication knows no boundaries. Our app bridges the gap between sign language users and non-sign language users through cutting-edge translation technology, fostering inclusivity and connection."),
            const SizedBox(height: 16),
            buildTextMedium16(text: "Our Story"),
            const SizedBox(height: 4),
            buildTextRegular12(
                text:
                    "It all started with a desire to make technology accessible for the deaf community. By combining advanced AI with a passion for inclusivity, we’ve created an app that translates sign language in real time, helping people communicate effortlessly."),
            const SizedBox(height: 16),
            buildTextMedium16(text: "Key Features Highlight"),
            const SizedBox(height: 4),
            buildBulletWithTextReguler12(
                text: "Real-time sign language translation."),
            const SizedBox(height: 4),
            buildBulletWithTextReguler12(
                text: "Intuitive video calling interface."),
            const SizedBox(height: 4),
            buildBulletWithTextReguler12(
                text:
                    "Accessible for everyone, regardless of language or hearing ability."),
          ],
        ),
      ),
    );
  }

  Row buildBulletWithTextReguler12({required String text}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(
          width: 9,
        ),
        const Column(
          children: [
            SizedBox(
              height: 5,
            ),
            Icon(
              Icons.circle,
              size: 10,
            ),
          ],
        ),
        const SizedBox(
          width: 9,
        ),
        Expanded(child: buildTextRegular12(text: text)),
      ],
    );
  }

  Text buildTextRegular12({required String text}) {
    return Text(
      text,
      style: AppTextStyles.styleRegular12,
    );
  }

  Text buildTextMedium16({required String text}) {
    return Text(
      text,
      style: AppTextStyles.styleMedium16,
    );
  }
}
