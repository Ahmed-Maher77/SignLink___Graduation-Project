import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sign_link/features/home/presentation/manager/cubit/home_view_cubit.dart';
import 'package:sign_link/features/home/presentation/view/widgets/custom_animated_container.dart';

class RecentsAndContactsButton extends StatelessWidget {
  const RecentsAndContactsButton({
    required this.state,
    super.key,
  });
  final HomeViewState state;
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: CustomAnimatedContainer(
            text: "Recents",
            isActive: state is HomeViewRecents,
            onTap: () {
              BlocProvider.of<HomeViewCubit>(context).recentsState();
            },
          ),
        ),
        const SizedBox(
          width: 8,
        ),
        Expanded(
          child: CustomAnimatedContainer(
            text: "Contacts",
            isActive: state is HomeViewContacts,
            onTap: () {
              BlocProvider.of<HomeViewCubit>(context).contactsState();
            },
          ),
        ),
      ],
    );
  }
}
