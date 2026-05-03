import 'package:flutter_bloc/flutter_bloc.dart';

class PasswordTextFormFieldCubit extends Cubit<bool> {
  PasswordTextFormFieldCubit() : super(true);
  bool isVisible = true;
  void changeState() {
    isVisible = !isVisible;
    emit(isVisible);
  }
}
