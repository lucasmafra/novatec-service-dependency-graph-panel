import {
    DataFrame, FieldType,
} from '@grafana/data';

class Vector<T> {

    values: T[];

    length: number;

    constructor(values: T[]) {
        this.values = values
        this.length = values.length
    }

    get(index: number): T {
        return this.values[index]
    }

    toArray(): T[] {
        return this.values
    }

}

export const series: DataFrame[] = [
  {
    "meta": {
      "transformations": [
        "merge",
        "organize"
      ]
    },
    "fields": [
      {
        "name": "Time",
        "type": FieldType.time,
          "values": new Vector([
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587,
            1660139775587
          ]),
        "config": {},
        "state": {
          "displayName": "Time",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
                "text": "Field",
                value: '',
            }
          },
          "seriesIndex": 0
        }
      },
      {
        "name": "endpoint",
        "type": FieldType.string,
          "values": new Vector([
            ":cerberus/sfn-debit-request",
            ":jurassic-park/bank-by-ispb",
            ":authorize-pix-transfer-out",
            ":bodyguard/authorize-request",
            ":jurassic-park/bank-by-ispb",
            ":karma-police/certificate-authorization",
            ":pix-transfer-out-request-v2",
            ":savings-accounts/brazil-data",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]),
        "config": {
          "filterable": true
        },
        "state": {
          "displayName": "endpoint",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
                "text": "Field",
                "value": "a"
            }
          },
          "seriesIndex": 0
        }
      },
      {
        "name": "method",
        "type": FieldType.string,
          "values": new Vector([
            ":post",
            ":get",
            ":post",
            ":post",
            ":get",
            ":get",
            ":put",
            ":get",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
          ]),
        "config": {
          "filterable": true
        },
        "state": {
          "displayName": "method",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
                "text": "Field",
                "value": "a"
            }
          },
          "seriesIndex": 1
        }
      },
      {
        "name": "service",
        "type": FieldType.string,
        "values": new Vector([
            "styx",
            "styx",
            "warriv-write",
            "warriv-write",
            "stormshield",
            "warriv-write",
            "stormshield",
            "warriv-write",
            "spi-icom-client",
            "styx",
            "styx",
            "cerberus",
            "cerberus",
            "diablo-write",
            "diablo-write",
            "warriv-write",
            "warriv-write",
            "warriv-write",
            "warriv-write",
            "warriv-write",
            "diablo-write",
            "warriv-write",
            "warriv-write",
            null,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "filterable": true
        },
        "state": {
          "displayName": "service",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
                "text": "Field",
                "value": "a"
            }
          },
          "seriesIndex": 2
        }
      },
      {
        "name": "Value #Http Throughput",
        "type": FieldType.number,
        "values": new Vector([
            250.8730175205372,
            234.69605733749617,
            337.8294997801374,
            336.78285879361397,
            962.37819614007,
            697.1378873043744,
            695.9692166168978,
            340.9412652791356,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "displayName": "req_per_second"
        },
        "state": {
          "displayName": "req_per_second",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
                "text": "Field",
                "value": "a"
            }
          },
          "seriesIndex": 3,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "Value #Http Error Rate",
       "type": FieldType.number,
       "values": new Vector([
            0,
            null,
            0.00021150486654657755,
            0,
            0,
            0,
            0.023665759710573116,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
       ]),
        "config": {
          "displayName": "error_rate"
        },
        "state": {
          "displayName": "error_rate",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 4,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "Value #Http Response Latency Seconds p99",
        "type": FieldType.number,
        "values": new Vector([
            0.1935391103522339,
            0.047711286725569756,
            0.7240340632682865,
            0.19068786957360628,
            0.009944054638074091,
            0.04939472815827615,
            0.7397561255523714,
            0.044581108161628955,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "displayName": "http_response_latency_seconds_p99"
        },
        "state": {
          "displayName": "http_response_latency_seconds_p99",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 5,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "topic",
        "type": FieldType.string,
        "values": new Vector([
            "SAVINGS.TRANSFER-OUT-DEBIT-REQUESTED",
            "SAVINGS.TRANSFER-OUT-DEBIT-REQUESTED",
            "WARRIV.MONEY-RETRIEVED",
            "WARRIV.MONEY-RETRIEVED",
            "SAVINGS.MONEY-RETRIEVED",
            "WARRIV.MONEY-RETRIEVED",
            "SAVINGS.MONEY-RETRIEVED",
            "WARRIV.MONEY-RETRIEVED",
            "SFN.SEND-SPI-DEBIT",
            "SFN.DEBIT-FAILED",
            "SFN.DEBIT-SETTLED",
            "SFN.DEBIT-SETTLEMENT-INTERNAL-TIMEOUT",
            "SFN.ICOM-NEW-ACK-PLATINUM",
            "SAVINGS.MONEY-NOT-RETRIEVED",
            "SAVINGS.MONEY-RETRIEVED",
            "SAVINGS.TRANSFER-OUT-DEBIT-FAILED",
            "SAVINGS.TRANSFER-OUT-DEBIT-SUCCEEDED",
            "WARRIV.NEW-PIX-TRANSFER-OUT-REQUESTED",
            "SAVINGS.MONEY-RETRIEVED",
            "WARRIV.SCHEDULE-PIX-TRANSFER-OUT-REQUEST",
            "SAVINGS.RETRIEVE-MONEY",
            "WARRIV.LIQUIDATE-SCHEDULED-PIX-TRANSFER-OUT-REQUEST",
            "SAVINGS.MONEY-NOT-RETRIEVED",
            "SAVINGS.MONEY-NOT-RETRIEVED",
            "SFN.ICOM-NEW-ACK-GOLD",
            "WARRIV.PIX-TRANSFER-OUT-FAILED",
            "WARRIV.PIX-TRANSFER-OUT-SUCCESS",
            "WARRIV.SCHEDULE-PIX-TRANSFER-OUT-REQUESTED"
        ]),
        "config": {
          "filterable": true
        },
        "state": {
          "displayName": "topic",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 6
        }
      },
      {
        "name": "Value #Kafka Consumer Throughput",
        "type": FieldType.number,
        "values": new Vector([
            334.38807246921215,
            334.38807246921215,
            334.5535007137539,
            334.5535007137539,
            null,
            334.5535007137539,
            null,
            334.5535007137539,
            251.70488126062062,
            3.8190587180016933,
            247.81552988131742,
            2.47641587203862,
            249.48706413167773,
            13.833326027897979,
            587.909767399221,
            3.871236278052496,
            332.3985134553855,
            335.47807000955254,
            589.0798359960307,
            0.31599869155088295,
            600.0320561413757,
            0,
            13.826504140045238,
            null,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "displayName": "messages_per_second"
        },
        "state": {
          "displayName": "messages_per_second",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 7,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "Value #Kafka Consumer Latency Seconds p99",
        "type": FieldType.number,
        "values": new Vector([
            0.049528047233978335,
            0.049528047233978335,
            0.2702878094585565,
            0.2702878094585565,
            null,
            0.2702878094585565,
            null,
            0.2702878094585565,
            0.04958289428318202,
            0.2856821464327439,
            0.2029643212984917,
            0.266119354206287,
            0.2487941177644002,
            0.04951325435867967,
            0.04951287604074169,
            0.2996105519570764,
            0.29110307499267013,
            0.27348677576803265,
            0.04951886610321411,
            0.0495,
            0.04951251704994217,
            null,
            0.058999506401950744,
            null,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "displayName": "consumption_latency_seconds_p99"
        },
        "state": {
          "displayName": "consumption_latency_seconds_p99",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 8,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "producer",
        "type": FieldType.string,
        "values": new Vector([
            null,
            null,
            "warriv-write",
            "warriv-write",
            "diablo-write",
            "warriv-write",
            "diablo-write",
            "warriv-write",
            null,
            "styx",
            "styx",
            "cerberus",
            null,
            "diablo-write",
            "diablo-write",
            "warriv-write",
            "warriv-write",
            "warriv-write",
            "diablo-write",
            null,
            null,
            null,
            "diablo-write",
            "warriv-write",
            null,
            null,
            null,
            null
        ]),
        "config": {
          "filterable": true
        },
        "state": {
          "displayName": "producer",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 9
        }
      },
      {
        "name": "Value #Kafka Consumer Deadletters",
        "type": FieldType.number,
        "values": new Vector([
            null,
            null,
            0,
            0,
            68,
            0,
            68,
            0,
            null,
            0,
            0,
            1,
            null,
            2,
            68,
            0,
            0,
            0,
            68,
            null,
            null,
            null,
            2,
            0,
            null,
            null,
            null,
            null
        ]),
        "config": {
          "displayName": "deadletters"
        },
        "state": {
          "displayName": "deadletters",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 10,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      },
      {
        "name": "group",
        "type": FieldType.string,
        "values": new Vector([
            "STYX",
            "STYX",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "SPI-ICOM-CLIENT",
            "STYX",
            "STYX",
            "CERBERUS",
            "CERBERUS",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "DIABLO-RETRIEVE-MONEY",
            "WARRIV",
            "WARRIV",
            "WARRIV",
            "CERBERUS",
            "WARRIV",
            "WARRIV",
            "WARRIV"
        ]),
        "config": {
          "filterable": true,
          "displayName": "group"
        },
        "state": {
          "displayName": "group",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 11
        }
      },
      {
        "name": "Value #Kafka Consumer Lag",
        "type": FieldType.number,
        "values": new Vector([
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ]),
        "config": {
          "displayName": "lag"
        },
        "state": {
          "displayName": "lag",
          "multipleFrames": false,
          "scopedVars": {
            "__series": {
              "text": "Series",
              "value": {
                "name": "Series (0)"
              }
            },
            "__field": {
              "text": "Field", "value": "a"
            }
          },
          "seriesIndex": 12,
          "range": {
            "min": 0,
            "max": 962.37819614007,
            "delta": 962.37819614007
          }
        }
      }
    ],
    "length": 28
  }
]
