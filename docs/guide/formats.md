# Formats

The `format` prop selects the cron dialect. Field count, field order and which
special characters are legal all change with it.

| `format` | Fields | Dialect |
|----------|--------|---------|
| `crontab` | 5 | Standard crontab |
| `spring` | 6 | Spring `@Scheduled` cron |
| `quartz` | 7 (year optional) | Quartz Scheduler |

## crontab (5-field)

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6)
* * * * *
```

```vue
<CronSelector v-model="cron" format="crontab" />
```

## quartz (7-field, year optional)

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-6)
│ │ │ │ │ │ ┌───────────── year (1970-2099)
0 * * * * ? *
```

Quartz accepts either 6 or 7 fields: when the trailing year field is omitted the
selector treats it as `*`. `0 * * * * ?` and `0 * * * * ? *` are both valid.

```vue
<CronSelector v-model="cron" format="quartz" />
```

Quartz also allows `?` in the `dayOfMonth` and `dayOfWeek` fields, meaning "no
specific value". In crontab mode `?` is rejected, and using it on any other field
raises a validation error.

## spring (6-field)

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-6)
0 * * * * *
```

```vue
<CronSelector v-model="cron" format="spring" />
```

## Field ranges

| Field | Min | Max | Notes |
|-------|-----|-----|-------|
| `second` | 0 | 59 | Quartz and Spring only |
| `minute` | 0 | 59 | |
| `hour` | 0 | 23 | |
| `dayOfMonth` | 1 | 31 | Supports the Quartz `L`, `L-n`, `nW` forms in Quartz mode |
| `month` | 1 | 12 | Accepts `JAN`–`DEC` |
| `dayOfWeek` | 0 | 6 | Accepts `SUN`–`SAT` |
| `year` | 1970 | 2099 | Quartz only, optional |

## Switching formats at runtime

Changing `format` rebuilds the editor but leaves your expression untouched, because
a conversion can be lossy — crontab has no seconds field, so `0 * * * * ? *` cannot
be represented in it. Update the expression yourself (or call `reset()` on the
`useCron` composable) after a format switch when you want the format default back.
