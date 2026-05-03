import 'package:flutter/material.dart';
import 'package:sign_link/features/home/presentation/view/widgets/contacts_list_item.dart';

class ContactsList extends StatelessWidget {
  const ContactsList({super.key});

  @override
  Widget build(BuildContext context) {
    return SliverList.builder(
      itemCount: 20,
      itemBuilder: (context, index) {
        return ContactsListItem(
          isLastIndex: index == 19,
        );
      },
    );
  }
}
