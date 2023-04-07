#!/usr/bin/env python
# Copyright (c) 2022 Lincoln D. Stein (https://github.com/lstein)

import warnings
from ldm.invoke.config import invokeai_configure

if __name__ == '__main__':
    warnings.warn("configure_invokeai.py is deprecated, running 'invokeai-configure'...", DeprecationWarning)
    invokeai_configure.main()
