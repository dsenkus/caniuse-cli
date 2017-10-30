## Tab Autocompletion
In **zsh**, you can write these:

```bash
echo '. <(./caniuse --completion)' >> ~/.zshrc
```

In **bash**, you should write:

```bash
./caniuse --completion >> ~/.caniuse.completion.sh
echo 'source ~/.caniuse.completion.sh' >> ~/.bashrc
```

In **fish**, you can write:

```bash
echo 'caniuse --completion-fish | source' >> ~/.config/fish/config.fish
```

That's all!

Now you have an autocompletion system. 

## Issues

```
caniuse bash: _get_comp_words_by_ref: command not found
bash: __ltrim_colon_completions: command not found
bash: _get_comp_words_by_ref: command not found
bash: __ltrim_colon_completions: command not found
```

Solution: install `bash-completion` package
