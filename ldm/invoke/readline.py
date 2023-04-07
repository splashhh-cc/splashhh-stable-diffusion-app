"""
Readline helper functions for invoke.py.
You may import the global singleton `completer` to get access to the
completer object itself. This is useful when you want to autocomplete
seeds:

 from ldm.invoke.readline import completer
 completer.add_seed(18247566)
 completer.add_seed(9281839)
"""
import os
import re
import atexit
from ldm.invoke.args import Args
from ldm.invoke.concepts_lib import HuggingFaceConceptsLibrary
from ldm.invoke.globals import Globals

# ---------------readline utilities---------------------
try:
    import readline
    readline_available = True
except (ImportError,ModuleNotFoundError) as e:
    print(f'** An error occurred when loading the readline module: {str(e)}')
    readline_available = False

IMG_EXTENSIONS     = ('.png','.jpg','.jpeg','.PNG','.JPG','.JPEG','.gif','.GIF')
WEIGHT_EXTENSIONS  = ('.ckpt','.vae','.safetensors')
TEXT_EXTENSIONS  = ('.txt','.TXT')
CONFIG_EXTENSIONS  = ('.yaml','.yml')
COMMANDS = (
    '--steps','-s',
    '--seed','-S',
    '--iterations','-n',
    '--width','-W','--height','-H',
    '--cfg_scale','-C',
    '--threshold',
    '--perlin',
    '--grid','-g',
    '--individual','-i',
    '--save_intermediates',
    '--init_img','-I',
    '--init_mask','-M',
    '--init_color',
    '--strength','-f',
    '--variants','-v',
    '--outdir','-o',
    '--sampler','-A','-m',
    '--embedding_path',
    '--device',
    '--grid','-g',
    '--facetool','-ft',
    '--facetool_strength','-G',
    '--codeformer_fidelity','-cf',
    '--upscale','-U',
    '-save_orig','--save_original',
    '--log_tokenization','-t',
    '--hires_fix',
    '--inpaint_replace','-r',
    '--png_compression','-z',
    '--text_mask','-tm',
    '--h_symmetry_time_pct',
    '--v_symmetry_time_pct',
    '!fix','!fetch','!replay','!history','!search','!clear',
    '!models','!switch','!import_model','!optimize_model','!convert_model','!edit_model','!del_model',
    '!mask','!triggers',
    )
MODEL_COMMANDS = (
    '!switch',
    '!edit_model',
    '!del_model',
    )
CKPT_MODEL_COMMANDS = (
    '!optimize_model',
)
WEIGHT_COMMANDS = (
    '!import_model',
    '!convert_model',
    )
IMG_PATH_COMMANDS = (
    '--outdir[=\s]',
    )
TEXT_PATH_COMMANDS=(
    '!replay',
    )
IMG_FILE_COMMANDS=(
    '!fix',
    '!fetch',
    '!mask',
    '--init_img[=\s]','-I',
    '--init_mask[=\s]','-M',
    '--init_color[=\s]',
    '--embedding_path[=\s]',
    )

path_regexp   = '(' + '|'.join(IMG_PATH_COMMANDS+IMG_FILE_COMMANDS) + ')\s*\S*$'
weight_regexp = '(' + '|'.join(WEIGHT_COMMANDS) + ')\s*\S*$'
text_regexp = '(' + '|'.join(TEXT_PATH_COMMANDS) + ')\s*\S*$'

class Completer(object):
    def __init__(self, options, models={}):
        self.options     = sorted(options)
        self.models      = models
        self.seeds       = set()
        self.matches     = list()
        self.default_dir = None
        self.linebuffer  = None
        self.auto_history_active = True
        self.extensions = None
        self.concepts = None
        self.embedding_terms = set()
        return

    def complete(self, text, state):
        '''
        Completes invoke command line.
        BUG: it doesn't correctly complete files that have spaces in the name.
        '''
        buffer = readline.get_line_buffer()

        if state == 0:

            # extensions defined, so go directly into path completion mode
            if self.extensions is not None:
                self.matches = self._path_completions(text, state, self.extensions)

            # looking for an image file
            elif re.search(path_regexp,buffer):
                do_shortcut = re.search('^'+'|'.join(IMG_FILE_COMMANDS),buffer)
                self.matches = self._path_completions(text, state, IMG_EXTENSIONS,shortcut_ok=do_shortcut)

            # looking for a seed
            elif re.search('(-S\s*|--seed[=\s])\d*$',buffer):
                self.matches= self._seed_completions(text,state)

            # looking for an embedding concept
            elif re.search('<[\w-]*$',buffer):
                self.matches= self._concept_completions(text,state)

            # looking for a model
            elif re.match('^'+'|'.join(MODEL_COMMANDS),buffer):
                self.matches= self._model_completions(text, state)

            # looking for a ckpt model
            elif re.match('^'+'|'.join(CKPT_MODEL_COMMANDS),buffer):
                self.matches= self._model_completions(text, state, ckpt_only=True)

            elif re.search(weight_regexp,buffer):
                self.matches = self._path_completions(
                    text,
                    state,
                    WEIGHT_EXTENSIONS,
                    default_dir=Globals.root,
                )

            elif re.search(text_regexp,buffer):
                self.matches = self._path_completions(text, state, TEXT_EXTENSIONS)

            # This is the first time for this text, so build a match list.
            elif text:
                self.matches = [
                    s for s in self.options if s and s.startswith(text)
                ]
            else:
                self.matches = self.options[:]

        # Return the state'th item from the match list,
        # if we have that many.
        try:
            response = self.matches[state]
        except IndexError:
            response = None
        return response

    def complete_extensions(self, extensions:list):
        '''
        If called with a list of extensions, will force completer
        to do file path completions.
        '''
        self.extensions=extensions

    def add_history(self,line):
        '''
        Pass thru to readline
        '''
        if not self.auto_history_active:
            readline.add_history(line)

    def clear_history(self):
        '''
        Pass clear_history() thru to readline
        '''
        readline.clear_history()

    def search_history(self,match:str):
        '''
        Like show_history() but only shows items that
        contain the match string.
        '''
        self.show_history(match)

    def remove_history_item(self,pos):
        readline.remove_history_item(pos)

    def add_seed(self, seed):
        '''
        Add a seed to the autocomplete list for display when -S is autocompleted.
        '''
        if seed is not None:
            self.seeds.add(str(seed))

    def set_default_dir(self, path):
        self.default_dir=path

    def set_options(self,options):
        self.options = options

    def get_line(self,index):
        try:
            line = self.get_history_item(index)
        except IndexError:
            return None
        return line

    def get_current_history_length(self):
        return readline.get_current_history_length()

    def get_history_item(self,index):
        return readline.get_history_item(index)

    def show_history(self,match=None):
        '''
        Print the session history using the pydoc pager
        '''
        import pydoc
        lines = list()
        h_len = self.get_current_history_length()
        if h_len < 1:
            print('<empty history>')
            return

        for i in range(0,h_len):
            line = self.get_history_item(i+1)
            if match and match not in line:
                continue
            lines.append(f'[{i+1}] {line}')
        pydoc.pager('\n'.join(lines))

    def set_line(self,line)->None:
        '''
        Set the default string displayed in the next line of input.
        '''
        self.linebuffer = line
        readline.redisplay()

    def update_models(self,models:dict)->None:
        '''
        update our list of models
        '''
        self.models = models

    def _seed_completions(self, text, state):
        m = re.search('(-S\s?|--seed[=\s]?)(\d*)',text)
        if m:
            switch  = m.groups()[0]
            partial = m.groups()[1]
        else:
            switch  = ''
            partial = text

        matches = list()
        for s in self.seeds:
            if s.startswith(partial):
                matches.append(switch+s)
        matches.sort()
        return matches

    def add_embedding_terms(self, terms:list[str]):
        self.embedding_terms = set(terms)
        if self.concepts:
            self.embedding_terms.update(set(self.concepts.list_concepts()))

    def _concept_completions(self, text, state):
        if self.concepts is None:
            # cache Concepts() instance so we can check for updates in concepts_list during runtime.
            self.concepts = HuggingFaceConceptsLibrary()
            self.embedding_terms.update(set(self.concepts.list_concepts()))
        else:
            self.embedding_terms.update(set(self.concepts.list_concepts()))

        partial = text[1:]  # this removes the leading '<'
        if len(partial) == 0:
            return list(self.embedding_terms)  # whole dump - think if user wants this!

        matches = list()
        for concept in self.embedding_terms:
            if concept.startswith(partial):
                matches.append(f'<{concept}>')
        matches.sort()
        return matches

    def _model_completions(self, text, state, ckpt_only=False):
        m = re.search('(!switch\s+)(\w*)',text)
        if m:
            switch  = m.groups()[0]
            partial = m.groups()[1]
        else:
            switch  = ''
            partial = text
        matches = list()
        for s in self.models:
            format = self.models[s]['format']
            if format == 'vae':
                continue
            if ckpt_only and format != 'ckpt':
                continue
            if s.startswith(partial):
                matches.append(switch+s)
        matches.sort()
        return matches

    def _pre_input_hook(self):
        if self.linebuffer:
            readline.insert_text(self.linebuffer)
            readline.redisplay()
            self.linebuffer = None

    def _path_completions(self, text, state, extensions, shortcut_ok=True, default_dir:str=''):
        # separate the switch from the partial path
        match = re.search('^(-\w|--\w+=?)(.*)',text)
        if match is None:
            switch = None
            partial_path = text
        else:
            switch,partial_path  = match.groups()

        partial_path = partial_path.lstrip()

        matches = list()
        path = os.path.expanduser(partial_path)

        if os.path.isdir(path):
            dir = path
        elif os.path.dirname(path) != '':
            dir = os.path.dirname(path)
        else:
            dir = default_dir if os.path.exists(default_dir)  else ''
            path= os.path.join(dir,path)

        dir_list = os.listdir(dir or '.')
        if shortcut_ok and os.path.exists(self.default_dir) and dir=='':
            dir_list += os.listdir(self.default_dir)

        for node in dir_list:
            if node.startswith('.') and len(node) > 1:
                continue
            full_path = os.path.join(dir, node)

            if not (node.endswith(extensions) or os.path.isdir(full_path)):
                continue

            if path and not full_path.startswith(path):
                continue

            if switch is None:
                match_path = os.path.join(dir,node)
                matches.append(match_path+'/' if os.path.isdir(full_path) else match_path)
            elif os.path.isdir(full_path):
                matches.append(
                    switch+os.path.join(os.path.dirname(full_path), node) + '/'
                )
            elif node.endswith(extensions):
                matches.append(
                    switch+os.path.join(os.path.dirname(full_path), node)
                )

        return matches

class DummyCompleter(Completer):
    def __init__(self,options):
        super().__init__(options)
        self.history = list()

    def add_history(self,line):
        self.history.append(line)

    def clear_history(self):
        self.history = list()

    def get_current_history_length(self):
        return len(self.history)

    def get_history_item(self,index):
        return self.history[index-1]

    def remove_history_item(self,index):
        return self.history.pop(index-1)

    def set_line(self,line):
        print(f'# {line}')

def generic_completer(commands:list)->Completer:
    if readline_available:
        completer = Completer(commands,[])
        readline.set_completer(completer.complete)
        readline.set_pre_input_hook(completer._pre_input_hook)
        readline.set_completer_delims(' ')
        readline.parse_and_bind('tab: complete')
        readline.parse_and_bind('set print-completions-horizontally off')
        readline.parse_and_bind('set page-completions on')
        readline.parse_and_bind('set skip-completed-text on')
        readline.parse_and_bind('set show-all-if-ambiguous on')
    else:
        completer = DummyCompleter(commands)
    return completer

def get_completer(opt:Args, models=[])->Completer:
    if readline_available:
        completer = Completer(COMMANDS,models)

        readline.set_completer(
            completer.complete
        )
        # pyreadline3 does not have a set_auto_history() method
        try:
            readline.set_auto_history(False)
            completer.auto_history_active = False
        except:
            completer.auto_history_active = True
        readline.set_pre_input_hook(completer._pre_input_hook)
        readline.set_completer_delims(' ')
        readline.parse_and_bind('tab: complete')
        readline.parse_and_bind('set print-completions-horizontally off')
        readline.parse_and_bind('set page-completions on')
        readline.parse_and_bind('set skip-completed-text on')
        readline.parse_and_bind('set show-all-if-ambiguous on')

        outdir = os.path.expanduser(opt.outdir)
        if os.path.isabs(outdir):
            histfile = os.path.join(outdir,'.invoke_history')
        else:
            histfile = os.path.join(Globals.root, outdir, '.invoke_history')
        try:
            readline.read_history_file(histfile)
            readline.set_history_length(1000)
        except FileNotFoundError:
            pass
        except OSError: # file likely corrupted
            newname = f'{histfile}.old'
            print(f'## Your history file {histfile} couldn\'t be loaded and may be corrupted. Renaming it to {newname}')
            os.replace(histfile,newname)
        atexit.register(readline.write_history_file, histfile)

    else:
        completer = DummyCompleter(COMMANDS)
    return completer
