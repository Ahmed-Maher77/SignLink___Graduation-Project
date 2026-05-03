import 'package:flutter/material.dart';
import 'package:sign_link/core/widgets/custom_appbar.dart';
import 'package:sign_link/features/home/presentation/view/widgets/contacts_view_body.dart';

class ContactUsView extends StatelessWidget {
  const ContactUsView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(
        text: "Contact Us",
      ),
      body: ContactsViewBody(),
    );
  }
}
