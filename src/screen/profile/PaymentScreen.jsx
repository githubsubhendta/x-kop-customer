import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CreditCardView,
  CreditCardInput,
} from 'react-native-credit-card-input';

const s = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    marginHorizontal: 'auto',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 60,
  },
  cardView: {
    alignSelf: 'center',
    marginTop: 15,
  },
  cardInput: {
    marginTop: 15,
    borderColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#dfdfdf',
    borderRadius: 5,
  },
  info: {
    fontFamily: Platform.select({
      ios: 'Courier',
      android: 'monospace',
      web: 'monospace',
    }),
  },
});

const toStatusIcon = (status) =>
  status === 'valid' ? '✅' : status === 'invalid' ? '❌' : '❓';

export default function PaymentScreen() {

  const [focusedField, setFocusedField] = useState();

  const [formData, setFormData] = useState();

  return (
    <ScrollView contentContainerStyle={s.container}>
  

      <CreditCardView
        focusedField={focusedField}
        type={formData?.values.type}
        number={formData?.values.number}
        expiry={formData?.values.expiry}
        cvc={formData?.values.cvc}
        style={s.cardView}
      />

        <CreditCardInput
          autoFocus
          style={s.cardInput}
          onChange={setFormData}
          onFocusField={setFocusedField}
        />
      

      <View style={s.infoContainer}>
        <Text style={s.info}>
          {formData?.valid
            ? '✅ Possibly valid card'
            : '❌ Invalid/Incomplete card'}
        </Text>

        <Text style={s.info}>
          {toStatusIcon(formData?.status.number)}
          {' Number\t: '}
          {formData?.values.number}
        </Text>

        <Text style={s.info}>
          {toStatusIcon(formData?.status.expiry)}
          {' Expiry\t: '}
          {formData?.values.expiry}
        </Text>

        <Text style={s.info}>
          {toStatusIcon(formData?.status.cvc)}
          {' Cvc   \t: '}
          {formData?.values.cvc}
        </Text>

        <Text style={s.info}>
          {'ℹ️ Type  \t: '}
          {formData?.values.type}
        </Text>
      </View>
    </ScrollView>
  );
}

