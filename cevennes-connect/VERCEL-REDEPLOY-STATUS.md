# 🔄 Redéploiement Vercel en cours

## Situation actuelle

**Problème identifié :**
- ✅ Les variables Supabase sont sur Vercel
- ✅ Le code Supabase fonctionne localement
- ❌ Vercel utilise encore l'ancien code (dernier build: 08 Oct 23:27)

**Solution appliquée :**
- ✅ Push du commit `0b5a61b` pour déclencher un nouveau déploiement
- ⏳ Vercel est en train de redéployer...

---

## Comment vérifier le statut du déploiement

### Option 1: Vercel Dashboard
1. Va sur https://vercel.com/gaetansimonot/cevennes-sud-website/deployments
2. Le déploiement le plus récent doit être en cours (⏳ Building)
3. Attends qu'il passe à ✅ Ready (2-3 minutes)

### Option 2: Tester l'API directement
```bash
curl "https://cevennes-sud-website.vercel.app/api/events?limit=1"
```

**Ancien système** (avant redéploiement) retourne :
```json
{"events":[{"id":1759963126179,...}]}
```
→ IDs timestamp longs

**Nouveau système** (après redéploiement) retourne :
```json
{"events":[{"id":1,...}]}
```
→ IDs séquentiels courts (Supabase)

---

## Une fois le redéploiement terminé

### Test 1: Vérifier que l'API utilise Supabase

```bash
curl "https://cevennes-sud-website.vercel.app/api/events?limit=2"
```

✅ **Attendu :** IDs numériques séquentiels (1, 2, 3...) au lieu des timestamps

### Test 2: Suppression d'un événement

1. Va sur https://cevennes-sud-website.vercel.app/admin/manage-events
2. Supprime un événement test
3. **Rafraîchis la page** (F5)
4. ✅ L'événement doit avoir disparu IMMÉDIATEMENT

### Test 3: Modification d'un événement

1. Va sur /admin/manage-events
2. Modifie le titre d'un événement
3. Va sur /evenements
4. ✅ La modification doit être visible INSTANTANÉMENT (pas de rebuild)

---

## Si ça ne marche toujours pas après le redéploiement

### Debug 1: Vérifier les variables Vercel

1. Va sur Vercel → Settings → Environment Variables
2. Vérifie que ces 3 variables existent :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Vérifie qu'elles sont activées pour "Production"**

### Debug 2: Vérifier les logs Vercel

1. Va sur le dernier déploiement
2. Clique sur "Functions"
3. Clique sur `api/events`
4. Regarde s'il y a des erreurs

### Debug 3: Forcer un redéploiement manuel

1. Va sur Vercel → Deployments
2. Clique sur le dernier déploiement ✅ Ready
3. Clique sur "..." → "Redeploy"
4. Coche "Use existing Build Cache" → NON
5. Clique "Redeploy"

---

## Timing attendu

- **Push commit:** ✅ Fait (0b5a61b)
- **Vercel détecte push:** ~30 secondes
- **Build en cours:** 2-3 minutes
- **Déploiement actif:** ~30 secondes
- **TOTAL:** ~3-4 minutes

---

## Prochaine étape

**Attends 3-4 minutes** puis :

1. Rafraîchis https://vercel.com/gaetansimonot/cevennes-sud-website/deployments
2. Vérifie que le status est ✅ Ready
3. Teste l'API avec curl (voir ci-dessus)
4. Teste la suppression dans l'admin

Si tout fonctionne, la migration Supabase est **100% terminée** ! 🎉

---

*Dernière mise à jour: Après push commit 0b5a61b*
