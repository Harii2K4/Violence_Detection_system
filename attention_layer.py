from tensorflow.keras import layers
import tensorflow as tf

class AttentionLayer(layers.Layer):
    def __init__(self, units=64, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        # Create trainable weights
        self.W = self.add_weight(
            name='attention_weight',
            shape=(input_shape[-1], self.units),
            initializer='random_normal',
            trainable=True
        )
        self.b = self.add_weight(
            name='attention_bias',
            shape=(self.units,),
            initializer='zeros',
            trainable=True
        )
        self.u = self.add_weight(
            name='context_vector',
            shape=(self.units, 1),
            initializer='random_normal',
            trainable=True
        )
        super(AttentionLayer, self).build(input_shape)

    def call(self, inputs):
        # uit = tanh(W * hit + b)
        uit = tf.tanh(tf.matmul(inputs, self.W) + self.b)

        # ait = softmax(uit * u)
        ait = tf.matmul(uit, self.u)
        attention_weights = tf.nn.softmax(ait, axis=1)

        # Weighted sum of input sequence
        attention_output = inputs * attention_weights
        return tf.reduce_sum(attention_output, axis=1)

    def get_config(self):
        config = super(AttentionLayer, self).get_config()
        config.update({
            'units': self.units
        })
        return config