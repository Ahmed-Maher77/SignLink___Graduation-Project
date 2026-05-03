import 'package:flutter/material.dart';
import 'package:sign_link/core/widgets/custom_appbar.dart';
import 'package:sign_link/features/home/presentation/view/widgets/customer_assistant_view_body.dart';

class CustomerAssistantView extends StatelessWidget {
  const CustomerAssistantView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(text: "Customer Assistant"),
      body: CustomerAssistantViewBody(),
    );
  }
}
