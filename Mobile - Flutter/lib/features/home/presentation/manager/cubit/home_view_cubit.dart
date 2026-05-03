import 'package:flutter_bloc/flutter_bloc.dart';

part 'home_view_state.dart';

class HomeViewCubit extends Cubit<HomeViewState> {
  HomeViewCubit() : super(HomeViewRecents());
  void recentsState() => emit(HomeViewRecents());
  void contactsState() => emit(HomeViewContacts());
}
